"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import GridBackground from "@/components/ui/GridBackground";
import BrutalistButton from "@/components/ui/BrutalistButton";
import { Users, Send, AlertCircle, MessageSquare } from "lucide-react";
import { useAuthStore } from "@/lib/auth.store";
import { API_ENDPOINTS } from "@/lib/api.config";

interface Reply {
    id: string;
    post_id: string;
    content: string;
    author: string;
    created_at: string;
}

interface Post {
    id: string;
    content: string;
    author: string;
    created_at: string;
    replies: Reply[];
}

export default function CommunityPage() {
    const { isAuthenticated, token } = useAuthStore();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newPost, setNewPost] = useState("");
    const [posting, setPosting] = useState(false);
    
    // Reply states
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
    const [replying, setReplying] = useState<Record<string, boolean>>({});

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await fetch(API_ENDPOINTS.COMMUNITY.POSTS);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to load posts");
            setPosts(data.posts || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPost.trim() || !token) return;

        try {
            setPosting(true);
            const res = await fetch(API_ENDPOINTS.COMMUNITY.POSTS, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content: newPost.trim() })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to post");
            setNewPost("");
            fetchPosts(); // Reload posts
        } catch (err: any) {
            alert(err.message);
        } finally {
            setPosting(false);
        }
    };

    const handleReplySubmit = async (postId: string) => {
        const text = replyTexts[postId];
        if (!text || !text.trim() || !token) return;

        try {
            setReplying(prev => ({ ...prev, [postId]: true }));
            const res = await fetch(`${API_ENDPOINTS.COMMUNITY.POSTS}/${postId}/replies`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ content: text.trim() })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to post reply");
            
            setReplyTexts(prev => ({ ...prev, [postId]: "" }));
            setReplyingTo(null);
            fetchPosts(); // Reload posts to grab the new reply
        } catch (err: any) {
            alert(err.message);
        } finally {
            setReplying(prev => ({ ...prev, [postId]: false }));
        }
    };

    return (
        <div className="min-h-screen bg-dark mt-16">
            <Navbar />
            <GridBackground cellSize={48} lineOpacity={0.06} className="relative min-h-screen px-4 py-12">
                <div className="max-w-4xl mx-auto z-10 relative mt-16">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center justify-center w-16 h-16 bg-lime border-3 border-dark shadow-brutal-dark mb-6"
                        >
                            <Users className="w-8 h-8 text-dark" />
                        </motion.div>
                        <h1 className="text-4xl sm:text-5xl font-grotesk font-black text-white mb-4 uppercase">
                            Community <span className="text-lime">Board</span>
                        </h1>
                        <p className="text-white/60 font-inter max-w-2xl mx-auto">
                            Share your interview experiences, tips, and ask questions to the AceTheInterview community.
                        </p>
                    </div>

                    {/* Posts List */}
                    <div className="space-y-6 mb-12">
                        {loading ? (
                            <div className="text-center text-lime font-grotesk animate-pulse py-12">Loading posts...</div>
                        ) : error ? (
                            <div className="text-center text-red-500 font-grotesk py-12 bg-red-500/10 border-2 border-red-500">{error}</div>
                        ) : posts.length === 0 ? (
                            <div className="text-center text-white/50 font-grotesk py-12 border-3 border-dashed border-white/20">No posts yet. Be the first to share!</div>
                        ) : (
                            posts.map((post, idx) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 + idx * 0.05 }}
                                    className="bg-card border-3 border-white/20 shadow-brutal-dark p-6 hover:border-lime/50 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-dark border-2 border-lime flex items-center justify-center text-lime font-grotesk font-bold text-lg">
                                                {post.author.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="text-white font-grotesk font-bold">{post.author}</h4>
                                                <p className="text-white/40 text-xs font-inter">
                                                    {new Date(post.created_at).toLocaleDateString(undefined, {
                                                        year: 'numeric', month: 'short', day: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-white/80 font-inter whitespace-pre-wrap leading-relaxed">
                                        {post.content}
                                    </p>

                                    {/* Replies Section */}
                                    <div className="mt-6 border-t-2 border-dark-200 pt-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h5 className="text-white/60 font-grotesk text-sm font-bold uppercase tracking-wide flex items-center gap-2">
                                                <MessageSquare className="w-4 h-4" />
                                                {post.replies && post.replies.length > 0 ? `${post.replies.length} Replies` : "No Replies Yet"}
                                            </h5>
                                            {isAuthenticated && (
                                                <button
                                                    onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                                                    className="text-lime text-xs font-grotesk font-bold uppercase tracking-wide hover:underline cursor-pointer transition-all"
                                                >
                                                    {replyingTo === post.id ? "Cancel Reply" : "Reply"}
                                                </button>
                                            )}
                                        </div>

                                        {/* Reply Input Box */}
                                        {replyingTo === post.id && (
                                            <div className="mb-4 bg-dark/50 border-2 border-lime/50 p-3">
                                                <textarea
                                                    className="w-full bg-dark border-2 border-dark-200 text-white p-3 font-inter text-sm mb-3 focus:outline-none focus:border-lime transition-colors resize-none placeholder:text-white/30"
                                                    rows={2}
                                                    placeholder="Write your reply..."
                                                    value={replyTexts[post.id] || ""}
                                                    onChange={(e) => setReplyTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                                                    disabled={replying[post.id]}
                                                />
                                                <div className="flex justify-end">
                                                    <BrutalistButton 
                                                        onClick={() => handleReplySubmit(post.id)} 
                                                        variant="primary" 
                                                        disabled={replying[post.id] || !(replyTexts[post.id] || "").trim()}
                                                    >
                                                        {replying[post.id] ? "Sending..." : "Submit Reply"}
                                                    </BrutalistButton>
                                                </div>
                                            </div>
                                        )}

                                        {/* List of Replies */}
                                        {post.replies && post.replies.length > 0 && (
                                            <div className="space-y-4 pl-4 border-l-2 border-dark-200">
                                                {post.replies.map((reply) => (
                                                    <div key={reply.id} className="bg-dark/30 p-4 border-2 border-white/10 hover:border-white/20 transition-colors">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 bg-dark border-2 border-white/30 flex items-center justify-center text-white/70 font-grotesk font-bold text-xs">
                                                                    {reply.author.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <h6 className="text-white/90 font-grotesk font-bold text-sm">{reply.author}</h6>
                                                                    <p className="text-white/30 text-[10px] font-inter uppercase">
                                                                        {new Date(reply.created_at).toLocaleDateString(undefined, {
                                                                            month: 'short', day: 'numeric',
                                                                            hour: '2-digit', minute: '2-digit'
                                                                        })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <p className="text-white/70 font-inter text-sm whitespace-pre-wrap leading-relaxed">
                                                            {reply.content}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Create Post Section */}
                    {isAuthenticated ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-card border-3 border-lime shadow-brutal p-6 mb-12"
                        >
                            <form onSubmit={handleSubmit}>
                                <textarea
                                    className="w-full bg-dark border-3 border-dark-200 text-white p-4 font-inter text-sm mb-4 focus:outline-none focus:border-lime transition-colors resize-none placeholder:text-white/30"
                                    rows={3}
                                    placeholder="What's on your mind? Share an interview tip..."
                                    value={newPost}
                                    onChange={(e) => setNewPost(e.target.value)}
                                    disabled={posting}
                                />
                                <div className="flex justify-end pt-2">
                                    <BrutalistButton type="submit" variant="primary" disabled={posting || !newPost.trim()}>
                                        <Send className="w-4 h-4 mr-2 inline-block" />
                                        {posting ? "Posting..." : "Share Post"}
                                    </BrutalistButton>
                                </div>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-blue-500/10 border-2 border-blue-500 p-6 mb-12 flex flex-col items-center justify-center text-center"
                        >
                            <AlertCircle className="w-8 h-8 text-blue-400 mb-2" />
                            <h3 className="text-blue-400 font-grotesk font-bold text-lg mb-2">Join the Conversation</h3>
                            <p className="text-blue-400/70 font-inter text-sm">You need to be logged in to create a post.</p>
                        </motion.div>
                    )}
                </div>
            </GridBackground>
        </div>
    );
}
