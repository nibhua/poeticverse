
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Search, Headphones, Play, Pause, Plus, Volume2, Clock, User, SkipBack, SkipForward, Volume, VolumeX } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";

export default function AudioLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const { data: audioPoems, isLoading } = useQuery({
    queryKey: ["audioPoems", searchTerm],
    queryFn: async () => {
      console.log("Fetching audio poems...");
      let query = supabase
        .from("audio_poems")
        .select(`
          *,
          user:profiles!audio_poems_user_id_fkey(username, profile_pic_url)
        `);

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching audio poems:", error);
        toast.error("Failed to fetch audio poems");
        throw error;
      }
      console.log("Fetched audio poems:", data);
      return data;
    },
  });

  // Set up audio listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleAudioEnd = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      cancelAnimationFrame(animationRef.current!);
    };

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleAudioEnd);

    return () => {
      if (audio) {
        audio.removeEventListener('loadeddata', setAudioData);
        audio.removeEventListener('timeupdate', setAudioTime);
        audio.removeEventListener('ended', handleAudioEnd);
      }
      cancelAnimationFrame(animationRef.current!);
    };
  }, [audioRef.current]);

  // Control volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const whilePlaying = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      animationRef.current = requestAnimationFrame(whilePlaying);
    }
  };

  const togglePlay = (audioUrl: string, poemId: string) => {
    if (currentAudio === poemId) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
        cancelAnimationFrame(animationRef.current!);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
        animationRef.current = requestAnimationFrame(whilePlaying);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        cancelAnimationFrame(animationRef.current!);
      }
      setCurrentAudio(poemId);
      audioRef.current = new Audio(audioUrl);
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        animationRef.current = requestAnimationFrame(whilePlaying);
        
        // Only increment play count for other users' audio
        const poem = audioPoems?.find(p => p.id === poemId);
        if (poem && poem.user_id !== currentUserId) {
          incrementPlayCount(poemId);
        }
      }).catch(error => {
        console.error("Error playing audio:", error);
        toast.error("Failed to play audio");
      });
    }
  };

  const incrementPlayCount = async (poemId: string) => {
    try {
      // Using UPDATE directly since the RPC doesn't exist
      const { error } = await supabase
        .from('audio_poems')
        .update({ impression_count: audioPoems?.find(p => p.id === poemId)?.impression_count + 1 || 1 })
        .eq('id', poemId);

      if (error) console.error("Error incrementing play count:", error);
    } catch (error) {
      console.error("Error incrementing play count:", error);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, audioRef.current.duration);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
    }
  };

  const changeRange = (values: number[]) => {
    if (audioRef.current && duration) {
      audioRef.current.currentTime = values[0] * duration;
      setCurrentTime(values[0] * duration);
    }
  };

  const changeVolume = (values: number[]) => {
    const newVolume = values[0];
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const explorePoems = audioPoems?.filter(poem => poem.user_id !== currentUserId) || [];
  const myPoems = audioPoems?.filter(poem => poem.user_id === currentUserId) || [];

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const VolumeIcon = () => {
    if (isMuted) return <VolumeX className="h-5 w-5" />;
    if (volume > 0.5) return <Volume2 className="h-5 w-5" />;
    return <Volume className="h-5 w-5" />;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
          <Headphones className="absolute inset-0 m-auto h-10 w-10 text-primary/50" />
        </div>
      </div>
    );
  }

  // Current playing audio details
  const currentPlayingPoem = audioPoems?.find(poem => poem.id === currentAudio);

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        variants={itemVariants}
      >
        <div>
          <motion.h1 
            className="text-3xl md:text-4xl font-bold text-gradient-subtle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Audio Poetry Library
          </motion.h1>
          <motion.p 
            className="text-gray-600 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Listen to poetic voices from around the world
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link to="/audio-library/create">
            <Button className="btn-gradient rounded-full px-6 py-2 h-auto font-medium">
              <Plus className="h-4 w-4 mr-2" />
              Upload Audio
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div 
        className="relative z-10 group"
        variants={itemVariants}
      >
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors duration-200" />
        <Input
          placeholder="Search poems by title or description..."
          className="search-modern w-full pl-12"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </motion.div>

      {/* Audio Player Controls */}
      {currentPlayingPoem && (
        <motion.div 
          className="glass-card p-4 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                <Headphones className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{currentPlayingPoem.title}</h3>
                <p className="text-sm text-gray-500">{currentPlayingPoem.user?.username || 'Anonymous'}</p>
              </div>
            </div>
            <div className="space-x-2">
              <span className="text-sm text-gray-500">
                {formatDuration(currentTime)} / {formatDuration(duration || 0)}
              </span>
            </div>
          </div>
          
          <Slider
            value={[duration ? currentTime / duration : 0]}
            max={1}
            step={0.01}
            onValueChange={changeRange}
            className="mb-4"
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={skipBackward}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              
              <button 
                onClick={() => togglePlay(currentPlayingPoem.audio_url, currentPlayingPoem.id)}
                className="p-3 bg-primary text-white rounded-full hover:opacity-90 transition-opacity"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </button>
              
              <button 
                onClick={skipForward}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onMouseEnter={() => setShowVolumeSlider(true)}
              >
                <VolumeIcon />
              </button>
              
              {showVolumeSlider && (
                <div 
                  className="absolute -left-20 bottom-full mb-2 bg-white rounded-lg shadow-lg p-3 min-w-28"
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <button 
                    onClick={toggleMute}
                    className="p-1 hover:bg-gray-100 rounded-full mb-2 mx-auto block"
                  >
                    <VolumeIcon />
                  </button>
                  <Slider
                    orientation="vertical"
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.01}
                    onValueChange={changeVolume}
                    className="h-24"
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      <motion.div variants={itemVariants}>
        <Tabs defaultValue="explore" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="explore" className="flex-1">Explore</TabsTrigger>
            <TabsTrigger value="my-audio" className="flex-1">My Audio</TabsTrigger>
          </TabsList>
          
          <TabsContent value="explore">
            <motion.div 
              className="grid gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {explorePoems.map((poem) => (
                <motion.div 
                  key={poem.id} 
                  className="card-3d group perspective-1000"
                  variants={itemVariants}
                >
                  <div className="glass-card p-5 transform-preserve-3d">
                    <div className="flex justify-between items-start">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => togglePlay(poem.audio_url, poem.id)}
                          className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary flex items-center justify-center text-white transform transition-transform duration-300 hover:scale-105"
                        >
                          {currentAudio === poem.id && isPlaying ? (
                            <Pause className="h-6 w-6" />
                          ) : (
                            <Play className="h-6 w-6 ml-1" />
                          )}
                        </button>
                        <div>
                          <h2 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">{poem.title}</h2>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <User className="h-3 w-3" />
                            <span>{poem.user?.username || "Anonymous"}</span>
                            <span className="text-gray-400">•</span>
                            <div className="flex items-center">
                              <Volume2 className="h-3 w-3 mr-1" />
                              <span>{poem.impression_count} listens</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{poem.duration ? formatDuration(poem.duration) : "--:--"}</span>
                      </div>
                    </div>
                    {poem.description && (
                      <p className="mt-3 text-gray-600">{poem.description}</p>
                    )}
                    <div className="mt-4 h-[2px] bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ 
                          width: currentAudio === poem.id ? `${(currentTime / duration) * 100}%` : '0%' 
                        }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {explorePoems.length === 0 && (
                <motion.div 
                  className="text-center py-16 glass-card"
                  variants={itemVariants}
                >
                  <Headphones className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl font-medium text-gray-400">No audio poems found</p>
                  <p className="text-gray-500 mt-2">
                    {searchTerm ? "Try adjusting your search" : "Be the first to upload an audio poem"}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </TabsContent>
          
          <TabsContent value="my-audio">
            <motion.div 
              className="grid gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {myPoems.map((poem) => (
                <motion.div 
                  key={poem.id} 
                  className="card-3d group perspective-1000"
                  variants={itemVariants}
                >
                  <div className="glass-card p-5 transform-preserve-3d">
                    <div className="flex justify-between items-start">
                      <div className="flex space-x-3">
                        <button 
                          onClick={() => togglePlay(poem.audio_url, poem.id)}
                          className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary flex items-center justify-center text-white transform transition-transform duration-300 hover:scale-105"
                        >
                          {currentAudio === poem.id && isPlaying ? (
                            <Pause className="h-6 w-6" />
                          ) : (
                            <Play className="h-6 w-6 ml-1" />
                          )}
                        </button>
                        <div>
                          <h2 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300">{poem.title}</h2>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>My upload</span>
                            <span className="text-gray-400">•</span>
                            <div className="flex items-center">
                              <Volume2 className="h-3 w-3 mr-1" />
                              <span>{poem.impression_count} listens</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="text-sm text-muted-foreground flex items-center justify-end">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{poem.duration ? formatDuration(poem.duration) : "--:--"}</span>
                        </div>
                        {poem.content_type === 'paid' && (
                          <Button variant="secondary" size="sm" className="rounded-full">
                            Rent for ${poem.rental_price}
                          </Button>
                        )}
                      </div>
                    </div>
                    {poem.description && (
                      <p className="mt-3 text-gray-600">{poem.description}</p>
                    )}
                    <div className="mt-4 h-[2px] bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ 
                          width: currentAudio === poem.id ? `${(currentTime / duration) * 100}%` : '0%' 
                        }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {myPoems.length === 0 && (
                <motion.div 
                  className="text-center py-16 glass-card"
                  variants={itemVariants}
                >
                  <Headphones className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl font-medium text-gray-400">You haven't uploaded any audio poems yet</p>
                  <Button className="mt-6 btn-gradient" asChild>
                    <Link to="/audio-library/create">Upload Audio</Link>
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
