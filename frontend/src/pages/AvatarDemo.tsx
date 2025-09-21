import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Slider } from '../components/ui/slider';
import { SimpleAvatar, ThreeDAvatar } from '@/components/ui';

const AvatarDemo = () => {
  const [size, setSize] = useState(120);
  const [emotion, setEmotion] = useState('neutral');
  const [is3D, setIs3D] = useState(false);
  const [enableControls, setEnableControls] = useState(false);

  const emotions = [
    'neutral', 'happy', 'thinking', 'confused', 'excited'
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Avatar Components Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Avatar Size</h3>
              <div className="flex items-center gap-4">
                <Slider
                  value={[size]}
                  onValueChange={([value]) => setSize(value)}
                  min={50}
                  max={300}
                  step={1}
                  className="w-full"
                />
                <span className="w-16 text-center">{size}px</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Emotion</h3>
              <div className="flex flex-wrap gap-2">
                {emotions.map((em) => (
                  <Button
                    key={em}
                    variant={emotion === em ? 'default' : 'outline'}
                    onClick={() => setEmotion(em)}
                    className="capitalize"
                  >
                    {em}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium">3D Settings</h3>
              <div className="flex items-center space-x-2">
                <Button
                  variant={is3D ? 'default' : 'outline'}
                  onClick={() => setIs3D(!is3D)}
                >
                  {is3D ? 'Disable 3D' : 'Enable 3D'}
                </Button>
                {is3D && (
                  <Button
                    variant={enableControls ? 'default' : 'outline'}
                    onClick={() => setEnableControls(!enableControls)}
                  >
                    {enableControls ? 'Disable Controls' : 'Enable Controls'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="p-6 flex items-center justify-center">
          <div className="w-full h-96 flex items-center justify-center">
            {is3D ? (
              <ThreeDAvatar 
                size={size / 100} 
                enableControls={enableControls}
                className="w-full h-full"
              />
            ) : (
              <SimpleAvatar 
                size={size} 
                className={`transition-all duration-300 ${emotion === 'happy' ? 'ring-4 ring-yellow-400' : ''}`}
              />
            )}
          </div>
        </Card>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="code" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-xs">
            <TabsTrigger value="code">Code Example</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
          </TabsList>
          <TabsContent value="code" className="mt-4">
            <pre className="bg-muted p-4 rounded-md overflow-x-auto">
              <code>
{`// 2D Avatar
<SimpleAvatar 
  size={${size}} 
  className="mx-auto"
/>

// 3D Avatar
<ThreeDAvatar 
  size={${(size/100).toFixed(1)}} 
  enableControls={${enableControls}}
  className="h-96"
/>`}
              </code>
            </pre>
          </TabsContent>
          <TabsContent value="usage" className="mt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Props</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border p-2 text-left">Prop</th>
                      <th className="border p-2 text-left">Type</th>
                      <th className="border p-2 text-left">Default</th>
                      <th className="border p-2 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">size</td>
                      <td className="border p-2">number</td>
                      <td className="border p-2">120 (px for 2D, scale for 3D)</td>
                      <td className="border p-2">Size of the avatar</td>
                    </tr>
                    <tr>
                      <td className="border p-2">className</td>
                      <td className="border p-2">string</td>
                      <td className="border p-2">''</td>
                      <td className="border p-2">Additional CSS classes</td>
                    </tr>
                    <tr>
                      <td className="border p-2">enableControls</td>
                      <td className="border p-2">boolean</td>
                      <td className="border p-2">false</td>
                      <td className="border p-2">Enable 3D orbit controls (3D only)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AvatarDemo;
