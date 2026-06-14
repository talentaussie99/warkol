import React from "react";
import { Heart, MessageCircle, RefreshCw, Trash2, ChevronDown, Sparkles } from "lucide-react";
import { LinimasaPost } from "../../types";
import { renderUserAvatar } from "../common/UIComponents";

interface TimelinePostProps {
  post: LinimasaPost;
  userName: string;
  userAvatar: string;
  isSelf: boolean;
  isCommentsExpanded: boolean;
  setExpandedCommentsPostId: (id: string | null) => void;
  editingPostId: string | null;
  setEditingPostId: (id: string | null) => void;
  editingPostText: string;
  setEditingPostText: (text: string) => void;
  handleUpdatePost: (postId: string, e: React.FormEvent) => void;
  handleDeletePost: (postId: string) => void;
  handleLikePost: (postId: string) => void;
  handleCreateComment: (postId: string, e: React.FormEvent) => void;
  newCommentText: string;
  setNewCommentText: (text: string) => void;
  hunger: number;
  thirst: number;
  _t: (id: string, en: string) => string;
}

export const TimelinePost: React.FC<TimelinePostProps> = ({
  post,
  userName,
  userAvatar,
  isSelf,
  isCommentsExpanded,
  setExpandedCommentsPostId,
  editingPostId,
  setEditingPostId,
  editingPostText,
  setEditingPostText,
  handleUpdatePost,
  handleDeletePost,
  handleLikePost,
  handleCreateComment,
  newCommentText,
  setNewCommentText,
  hunger,
  thirst,
  _t
}) => {
  return (
    <div className="p-3 bg-[#171412] border border-white/5 rounded-lg flex flex-col gap-2.5 relative transition-all hover:bg-neutral-900/50 animate-fade-in">
      {/* Post Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isSelf ? (
            renderUserAvatar(userAvatar, "w-7 h-7", "border border-amber-500/25")
          ) : (
            <div className={`w-7 h-7 rounded-full ${post.avatarColor || "bg-[#E9C46A]"} text-neutral-900 font-extrabold flex items-center justify-center text-xs shadow`}>
              {post.author ? post.author.charAt(0).toUpperCase() : "?"}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-xs font-bold text-stone-200 font-sans">{post.author}</span>
            <span className="text-[9px] text-stone-500 font-mono mt-0.5">
              {post.timestamp}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {isSelf && (
            <>
              {Date.now() - post.createdAt < 15 * 60 * 1000 && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingPostId(post.id);
                    setEditingPostText(post.text);
                  }}
                  className="text-stone-500 hover:text-amber-400 p-1 rounded hover:bg-amber-500/10 transition-all cursor-pointer"
                  title="Edit postingan kawan"
                >
                  <RefreshCw size={11} />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleDeletePost(post.id)}
                className="text-stone-500 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-all cursor-pointer"
                title="Hapus postingan kawan"
              >
                <Trash2 size={11} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Caption/Content or Edit Form */}
      {editingPostId === post.id ? (
        <form 
          onSubmit={(e) => handleUpdatePost(post.id, e)}
          className="flex flex-col gap-2 bg-black/30 p-2 rounded-lg border border-amber-500/20"
        >
          <textarea
            value={editingPostText}
            onChange={(e) => setEditingPostText(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#E9C46A] font-sans resize-none"
            rows={2}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditingPostId(null)}
              className="px-2 py-1 text-[9px] text-stone-500 hover:text-stone-300 font-bold uppercase tracking-wider"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-2.5 py-1 bg-[#E9C46A] text-neutral-900 rounded text-[9px] font-black uppercase tracking-wider shadow-sm"
            >
              Simpan
            </button>
          </div>
        </form>
      ) : (
        <p className="text-xs text-stone-300 leading-relaxed font-sans whitespace-pre-wrap select-text">
          {post.text}
        </p>
      )}

      {/* Post Photo */}
      {post.image && (
        <div className="w-full bg-[#120f0e] rounded-lg p-1 border border-white/10 flex items-center justify-center overflow-hidden">
          <img
            src={post.image}
            alt="Post Image Media"
            className="max-h-[250px] max-w-full object-contain rounded-md"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Interaction buttons line */}
      <div className="pt-1.5 border-t border-white/5 flex items-center gap-4 text-stone-400 select-none">
        <button
          type="button"
          onClick={() => handleLikePost(post.id)}
          className={`flex items-center gap-1.5 text-[10.5px] cursor-pointer hover:text-rose-400 transition-colors ${
            post.isLikedByUser ? "text-rose-400 font-bold" : ""
          }`}
        >
          <Heart size={12} className={post.isLikedByUser ? "fill-rose-500 text-rose-500" : "fill-transparent"} />
          <span>{post.likes} {_t("Suka", "Like" + (post.likes !== 1 ? "s" : ""))}</span>
        </button>

        <button
          type="button"
          onClick={() => setExpandedCommentsPostId(isCommentsExpanded ? null : post.id)}
          className={`flex items-center gap-1.5 text-[10.5px] cursor-pointer hover:text-amber-400 transition-colors ${
            isCommentsExpanded ? "text-amber-400 font-bold" : ""
          }`}
        >
          <MessageCircle size={12} />
          <span>{post.comments.length} {_t("Komentar", "Comment" + (post.comments.length !== 1 ? "s" : ""))}</span>
        </button>
      </div>

      {/* Expandable Comments list */}
      {isCommentsExpanded && (
        <div className="mt-2.5 pt-2.5 border-t border-dashed border-white/5 space-y-3 animate-fade-in">
          {hunger <= 10 || thirst <= 10 ? (
            <div className="text-[10px] text-amber-500/80 bg-amber-950/20 px-2.5 py-1.5 rounded border border-amber-950/30 font-mono italic text-center select-none">
              ⚠️ {_t("Perut keroncongan / haus, silakan santap menu hidangan dulu agar bisa membalas.", "Stomach growling / thirsty, please eat or drink first to reply.")}
            </div>
          ) : (
            <form
              onSubmit={(e) => handleCreateComment(post.id, e)}
              className="flex items-center gap-2 mt-1"
            >
              <input
                type="text"
                placeholder={_t("Tulis balasan di postingan ini...", "Write a reply to this post...")}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1 bg-black/45 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white placeholder-white/20 focus:outline-[#E9C46A] focus:outline-none focus:border-[#E9C46A]"
                required
              />
              <button
                type="submit"
                className="py-1 px-3 bg-amber-500/10 hover:bg-amber-500 text-[#E9C46A] hover:text-neutral-900 border border-amber-500/20 font-bold rounded-lg transition-all text-[10px] cursor-pointer"
              >
                Balas
              </button>
            </form>
          )}

          {post.comments.length > 0 && (
            <div className="space-y-2 bg-black/25 p-2 rounded-lg border border-white/5 max-h-[140px] overflow-y-auto no-scrollbar">
              {post.comments.map((comment) => (
                <div key={comment.id} className="text-[10.5px] leading-relaxed border-b border-white/5 pb-1.5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300/90 font-sans">{comment.author}:</span>
                    <span className="text-[8px] text-stone-500 font-mono">
                      {comment.timestamp}
                    </span>
                  </div>
                  <p className="text-stone-300 mt-0.5 ml-1 select-text">
                    {comment.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
