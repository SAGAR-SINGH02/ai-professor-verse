import { useState, useRef, useCallback, useEffect } from 'react';
import { useSocket } from './useSocket';

interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

const defaultConfig: WebRTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const useWebRTC = (config: WebRTCConfig = defaultConfig) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  
  const { socket } = useSocket();

  // Initialize peer connection
  const initializePeerConnection = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const peerConnection = new RTCPeerConnection(config);
    peerConnectionRef.current = peerConnection;

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteStream(remoteStream);
      
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc-ice-candidate', {
          candidate: event.candidate,
          sessionId: 'ai-session'
        });
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      setIsConnected(state === 'connected');
      
      if (state === 'failed' || state === 'disconnected') {
        console.log('WebRTC connection failed or disconnected');
      }
    };

    return peerConnection;
  }, [config, socket]);

  // Get user media
  const getUserMedia = useCallback(async (video = true, audio = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false,
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      });

      setLocalStream(stream);
      setIsVideoEnabled(video);
      setIsAudioEnabled(audio);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }, []);

  // Start call
  const startCall = useCallback(async () => {
    try {
      const stream = await getUserMedia(true, true);
      const peerConnection = initializePeerConnection();

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Create and send offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      if (socket) {
        socket.emit('webrtc-offer', {
          offer,
          sessionId: 'ai-session'
        });
      }

      return stream;
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }, [getUserMedia, initializePeerConnection, socket]);

  // Answer call
  const answerCall = useCallback(async (offer: RTCSessionDescriptionInit) => {
    try {
      const stream = await getUserMedia(true, true);
      const peerConnection = initializePeerConnection();

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Set remote description and create answer
      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      if (socket) {
        socket.emit('webrtc-answer', {
          answer,
          sessionId: 'ai-session'
        });
      }

      return stream;
    } catch (error) {
      console.error('Error answering call:', error);
      throw error;
    }
  }, [getUserMedia, initializePeerConnection, socket]);

  // Handle remote answer
  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(answer);
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }, []);

  // Handle ICE candidate
  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }, []);

  // End call
  const endCall = useCallback(() => {
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setRemoteStream(null);
    setIsConnected(false);
    setIsVideoEnabled(false);
    setIsAudioEnabled(false);
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, [localStream]);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      if (peerConnectionRef.current && localStream) {
        // Replace video track with screen share
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );

        if (sender) {
          await sender.replaceTrack(videoTrack);
        }

        // Handle screen share end
        videoTrack.onended = () => {
          stopScreenShare();
        };

        if (socket) {
          socket.emit('start-screen-share', {
            sessionId: 'ai-session'
          });
        }
      }

      return screenStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }, [localStream, socket]);

  // Stop screen sharing
  const stopScreenShare = useCallback(async () => {
    try {
      if (peerConnectionRef.current && localStream) {
        // Replace screen share with camera
        const videoTrack = localStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );

        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }

        if (socket) {
          socket.emit('stop-screen-share', {
            sessionId: 'ai-session'
          });
        }
      }
    } catch (error) {
      console.error('Error stopping screen share:', error);
    }
  }, [localStream, socket]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('webrtc-offer', ({ offer }) => {
      answerCall(offer);
    });

    socket.on('webrtc-answer', ({ answer }) => {
      handleAnswer(answer);
    });

    socket.on('webrtc-ice-candidate', ({ candidate }) => {
      handleIceCandidate(candidate);
    });

    return () => {
      socket.off('webrtc-offer');
      socket.off('webrtc-answer');
      socket.off('webrtc-ice-candidate');
    };
  }, [socket, answerCall, handleAnswer, handleIceCandidate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endCall();
    };
  }, [endCall]);

  return {
    localStream,
    remoteStream,
    isConnected,
    isVideoEnabled,
    isAudioEnabled,
    localVideoRef,
    remoteVideoRef,
    startCall,
    endCall,
    toggleVideo,
    toggleAudio,
    startScreenShare,
    stopScreenShare,
  };
};
