import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Docker from 'dockerode';
import { VM } from 'vm2';
import { CodeExecutionRequest, CodeExecutionResult } from '@ai-professor/shared';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface SandboxConfig {
  timeout: number;
  memoryLimit: number;
  cpuLimit: number;
  networkAccess: boolean;
  allowedModules: string[];
  blockedModules: string[];
}

export interface ExecutionEnvironment {
  language: string;
  dockerImage: string;
  command: string[];
  fileExtension: string;
  compileCommand?: string[];
}

@Injectable()
export class SandboxService {
  private readonly logger = new Logger(SandboxService.name);
  private readonly docker: Docker;
  private readonly tempDir: string;
  private readonly environments: Map<string, ExecutionEnvironment>;

  constructor(private readonly configService: ConfigService) {
    this.docker = new Docker();
    this.tempDir = this.configService.get<string>('TEMP_DIR', '/tmp/code-execution');
    this.environments = this.initializeEnvironments();
    this.ensureTempDirectory();
  }

  async executeCode(request: CodeExecutionRequest): Promise<CodeExecutionResult> {
    const startTime = Date.now();
    const executionId = this.generateExecutionId();
    const codeHash = this.generateCodeHash(request.code);

    this.logger.log(`🚀 Starting code execution ${executionId} for user ${request.userId}`);

    try {
      // Validate request
      this.validateRequest(request);

      // Get execution environment
      const environment = this.environments.get(request.language.toLowerCase());
      if (!environment) {
        throw new Error(`Unsupported language: ${request.language}`);
      }

      // Choose execution method based on language and security requirements
      let result: CodeExecutionResult;
      
      if (this.isJavaScriptLike(request.language)) {
        result = await this.executeJavaScriptSafely(request, executionId, codeHash);
      } else {
        result = await this.executeInDocker(request, environment, executionId, codeHash);
      }

      const executionTime = Date.now() - startTime;
      result.executionTime = executionTime;

      this.logger.log(`✅ Code execution ${executionId} completed in ${executionTime}ms`);
      return result;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logger.error(`❌ Code execution ${executionId} failed:`, error);

      return {
        id: executionId,
        status: 'error',
        error: error.message,
        executionTime,
        memoryUsed: 0,
        timestamp: new Date(),
        language: request.language,
        codeHash,
      };
    }
  }

  private async executeJavaScriptSafely(
    request: CodeExecutionRequest,
    executionId: string,
    codeHash: string,
  ): Promise<CodeExecutionResult> {
    const startTime = Date.now();
    let output = '';
    let error = '';
    let memoryUsed = 0;

    try {
      // Create secure VM context
      const vm = new VM({
        timeout: request.timeout || 5000,
        sandbox: {
          console: {
            log: (...args: any[]) => {
              output += args.join(' ') + '\n';
            },
            error: (...args: any[]) => {
              error += args.join(' ') + '\n';
            },
          },
          // Add safe built-in functions
          Math,
          Date,
          JSON,
          parseInt,
          parseFloat,
          isNaN,
          isFinite,
          // Input from request
          input: request.input || '',
        },
        eval: false,
        wasm: false,
        fixAsync: true,
      });

      // Wrap code to capture return value
      const wrappedCode = `
        try {
          ${request.code}
        } catch (err) {
          console.error('Runtime Error:', err.message);
        }
      `;

      // Execute code
      const result = vm.run(wrappedCode);
      
      // Estimate memory usage (simplified)
      memoryUsed = Buffer.byteLength(output + error + request.code, 'utf8');

      return {
        id: executionId,
        status: error ? 'error' : 'success',
        output: output.trim(),
        error: error.trim() || undefined,
        executionTime: Date.now() - startTime,
        memoryUsed,
        timestamp: new Date(),
        language: request.language,
        codeHash,
      };

    } catch (vmError) {
      return {
        id: executionId,
        status: 'error',
        error: vmError.message,
        executionTime: Date.now() - startTime,
        memoryUsed,
        timestamp: new Date(),
        language: request.language,
        codeHash,
      };
    }
  }

  private async executeInDocker(
    request: CodeExecutionRequest,
    environment: ExecutionEnvironment,
    executionId: string,
    codeHash: string,
  ): Promise<CodeExecutionResult> {
    const startTime = Date.now();
    const workDir = path.join(this.tempDir, executionId);
    const fileName = `main${environment.fileExtension}`;
    const filePath = path.join(workDir, fileName);

    try {
      // Create working directory
      await fs.mkdir(workDir, { recursive: true });

      // Write code to file
      await fs.writeFile(filePath, request.code, 'utf8');

      // Write input file if provided
      if (request.input) {
        await fs.writeFile(path.join(workDir, 'input.txt'), request.input, 'utf8');
      }

      // Create Docker container
      const container = await this.docker.createContainer({
        Image: environment.dockerImage,
        Cmd: environment.command.concat([fileName]),
        WorkingDir: '/workspace',
        HostConfig: {
          Memory: (request.memoryLimit || 128) * 1024 * 1024, // Convert MB to bytes
          CpuQuota: 50000, // 50% CPU
          CpuPeriod: 100000,
          NetworkMode: 'none', // No network access
          ReadonlyRootfs: true,
          Binds: [`${workDir}:/workspace:ro`],
          AutoRemove: true,
        },
        AttachStdout: true,
        AttachStderr: true,
      });

      // Start container and capture output
      const stream = await container.attach({
        stream: true,
        stdout: true,
        stderr: true,
      });

      await container.start();

      // Set timeout
      const timeout = setTimeout(async () => {
        try {
          await container.kill();
        } catch (e) {
          // Container might already be stopped
        }
      }, request.timeout || 10000);

      // Wait for container to finish
      const [output, containerInfo] = await Promise.all([
        this.streamToString(stream),
        container.wait(),
      ]);

      clearTimeout(timeout);

      // Get container stats
      const stats = await this.getContainerStats(container);
      
      // Parse output
      const { stdout, stderr } = this.parseDockerOutput(output);

      // Determine status
      let status: 'success' | 'error' | 'timeout' | 'memory_exceeded' = 'success';
      if (containerInfo.StatusCode !== 0) {
        status = 'error';
      }

      return {
        id: executionId,
        status,
        output: stdout,
        error: stderr || undefined,
        executionTime: Date.now() - startTime,
        memoryUsed: stats.memoryUsed,
        timestamp: new Date(),
        language: request.language,
        codeHash,
      };

    } catch (error) {
      if (error.message.includes('timeout')) {
        return {
          id: executionId,
          status: 'timeout',
          error: 'Code execution timed out',
          executionTime: Date.now() - startTime,
          memoryUsed: 0,
          timestamp: new Date(),
          language: request.language,
          codeHash,
        };
      }

      throw error;
    } finally {
      // Cleanup
      try {
        await fs.rm(workDir, { recursive: true, force: true });
      } catch (cleanupError) {
        this.logger.warn(`Failed to cleanup directory ${workDir}:`, cleanupError);
      }
    }
  }

  async analyzeCodeComplexity(code: string, language: string): Promise<{
    cyclomaticComplexity: number;
    linesOfCode: number;
    maintainabilityIndex: number;
    cognitiveComplexity: number;
  }> {
    const lines = code.split('\n').filter(line => line.trim().length > 0);
    const linesOfCode = lines.length;

    // Simple complexity analysis (would use proper AST parsing in production)
    let cyclomaticComplexity = 1; // Base complexity
    let cognitiveComplexity = 0;

    const complexityKeywords = {
      javascript: ['if', 'else', 'while', 'for', 'switch', 'case', 'catch', '&&', '||', '?'],
      python: ['if', 'elif', 'else', 'while', 'for', 'try', 'except', 'and', 'or'],
      java: ['if', 'else', 'while', 'for', 'switch', 'case', 'catch', '&&', '||', '?'],
      cpp: ['if', 'else', 'while', 'for', 'switch', 'case', 'catch', '&&', '||', '?'],
    };

    const keywords = complexityKeywords[language.toLowerCase()] || complexityKeywords.javascript;

    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = code.match(regex);
      if (matches) {
        cyclomaticComplexity += matches.length;
        cognitiveComplexity += matches.length;
      }
    });

    // Calculate maintainability index (simplified)
    const halsteadVolume = Math.log2(linesOfCode) * linesOfCode; // Simplified
    const maintainabilityIndex = Math.max(0, 
      171 - 5.2 * Math.log(halsteadVolume) - 0.23 * cyclomaticComplexity - 16.2 * Math.log(linesOfCode)
    );

    return {
      cyclomaticComplexity,
      linesOfCode,
      maintainabilityIndex: Math.round(maintainabilityIndex),
      cognitiveComplexity,
    };
  }

  async getExecutionHistory(userId: string, limit: number = 10): Promise<CodeExecutionResult[]> {
    // This would typically query a database
    // For now, return empty array as placeholder
    return [];
  }

  private initializeEnvironments(): Map<string, ExecutionEnvironment> {
    const environments = new Map<string, ExecutionEnvironment>();

    environments.set('javascript', {
      language: 'javascript',
      dockerImage: 'node:18-alpine',
      command: ['node'],
      fileExtension: '.js',
    });

    environments.set('python', {
      language: 'python',
      dockerImage: 'python:3.11-alpine',
      command: ['python'],
      fileExtension: '.py',
    });

    environments.set('java', {
      language: 'java',
      dockerImage: 'openjdk:17-alpine',
      command: ['sh', '-c', 'javac Main.java && java Main'],
      fileExtension: '.java',
      compileCommand: ['javac'],
    });

    environments.set('cpp', {
      language: 'cpp',
      dockerImage: 'gcc:alpine',
      command: ['sh', '-c', 'g++ -o main main.cpp && ./main'],
      fileExtension: '.cpp',
      compileCommand: ['g++', '-o', 'main'],
    });

    environments.set('c', {
      language: 'c',
      dockerImage: 'gcc:alpine',
      command: ['sh', '-c', 'gcc -o main main.c && ./main'],
      fileExtension: '.c',
      compileCommand: ['gcc', '-o', 'main'],
    });

    environments.set('go', {
      language: 'go',
      dockerImage: 'golang:alpine',
      command: ['go', 'run'],
      fileExtension: '.go',
    });

    environments.set('rust', {
      language: 'rust',
      dockerImage: 'rust:alpine',
      command: ['sh', '-c', 'rustc main.rs && ./main'],
      fileExtension: '.rs',
      compileCommand: ['rustc'],
    });

    return environments;
  }

  private validateRequest(request: CodeExecutionRequest): void {
    if (!request.code || request.code.trim().length === 0) {
      throw new Error('Code cannot be empty');
    }

    if (request.code.length > 10000) {
      throw new Error('Code too long (max 10,000 characters)');
    }

    if (request.timeout && request.timeout > 30000) {
      throw new Error('Timeout too long (max 30 seconds)');
    }

    if (request.memoryLimit && request.memoryLimit > 512) {
      throw new Error('Memory limit too high (max 512 MB)');
    }

    // Check for potentially dangerous code patterns
    const dangerousPatterns = [
      /require\s*\(\s*['"]fs['"]/, // File system access
      /require\s*\(\s*['"]child_process['"]/, // Process execution
      /require\s*\(\s*['"]net['"]/, // Network access
      /import\s+os/, // Python OS module
      /import\s+subprocess/, // Python subprocess
      /System\.exit/, // Java system exit
      /#include\s*<cstdlib>/, // C++ system functions
    ];

    dangerousPatterns.forEach(pattern => {
      if (pattern.test(request.code)) {
        throw new Error('Code contains potentially dangerous operations');
      }
    });
  }

  private isJavaScriptLike(language: string): boolean {
    return ['javascript', 'js', 'typescript', 'ts'].includes(language.toLowerCase());
  }

  private generateExecutionId(): string {
    return crypto.randomUUID();
  }

  private generateCodeHash(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  private async ensureTempDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      this.logger.error('Failed to create temp directory:', error);
    }
  }

  private async streamToString(stream: NodeJS.ReadableStream): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      stream.on('error', reject);
    });
  }

  private parseDockerOutput(output: string): { stdout: string; stderr: string } {
    // Docker multiplexes stdout and stderr
    // This is a simplified parser
    const lines = output.split('\n');
    let stdout = '';
    let stderr = '';

    lines.forEach(line => {
      if (line.includes('Error:') || line.includes('error:')) {
        stderr += line + '\n';
      } else {
        stdout += line + '\n';
      }
    });

    return {
      stdout: stdout.trim(),
      stderr: stderr.trim(),
    };
  }

  private async getContainerStats(container: Docker.Container): Promise<{ memoryUsed: number }> {
    try {
      const stats = await container.stats({ stream: false });
      const memoryUsed = stats.memory_stats?.usage || 0;
      return { memoryUsed };
    } catch (error) {
      return { memoryUsed: 0 };
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Check if Docker is available
      await this.docker.ping();
      
      // Check if temp directory is writable
      const testFile = path.join(this.tempDir, 'health-check.txt');
      await fs.writeFile(testFile, 'test', 'utf8');
      await fs.unlink(testFile);
      
      return true;
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return false;
    }
  }
}
