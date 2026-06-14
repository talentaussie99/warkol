import React, { useState } from "react";
import { Sparkles, Plus, ChevronDown, RefreshCw } from "lucide-react";
import { LinimasaPost } from "../../types";
import { TimelinePost } from "./TimelinePost";
import { renderUserAvatar } from "../common/UIComponents";

interface TimelineProps {
  _t: (id: string, en: string) => string;
  userName: string;
  userAvatar: string;
  linimasaPosts: LinimasaPost[];
  visiblePostsCount: number;
  seeMoreClicks: number;
  handleSeeMore: () => void;
  handleCreatePost: (e: React.FormEvent) => void;
  newPostText: string;
  setNewPostText: (text: string) => void;
  newPostImage: string;
  setNewPostImage: (url: string) => void;
  newPostImageFile: File | null;
  setNewPostImageFile: (file: File | null) => void;
  expandedCommentsPostId: string | null;
  setExpandedCommentsPostId: (id: string | null) => void;
  editingPostId: string | null;
  setEditingPostId: (id: string | null) => void;
  editingPostText: string;
  setEditingPostText: (text: string) => void;
  handleUpdatePost: (postId: string, e: React.FormEvent) => void;
  handleDeletePost: (postId: string) => void;
  handleLikePost: (postId: string) => void;
  handleCreateComment: (postId: string, e: React.FormEvent) => void;
  newCommentTexts: Record<string, string>;
  setNewCommentTexts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  hunger: number;
  thirst: number;
}

export const Timeline: React.FC<TimelineProps> = ({
  _t,
  userName,
  userAvatar,
  linimasaPosts,
  visiblePostsCount,
  seeMoreClicks,
  handleSeeMore,
  handleCreatePost,
  newPostText,
  setNewPostText,
  newPostImage,
  setNewPostImage,
  newPostImageFile,
  setNewPostImageFile,
  expandedCommentsPostId,
  setExpandedCommentsPostId,
  editingPostId,
  setEditingPostId,
  editingPostText,
  setEditingPostText,
  handleUpdatePost,
  handleDeletePost,
  handleLikePost,
  handleCreateComment,
  newCommentTexts,
  setNewCommentTexts,
  hunger,
  thirst
}) => {
  return (
    <div id="linimasa-container" className="immersive-card p-4 bg-gradient-to-br from-[#1d1916] to-[#141210] border border-amber-900/30 rounded-xl flex flex-col gap-4 animate-fade-in mb-1 h-[1050px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase text-[#E9C46A] tracking-[0.2em] font-sans">
            📍 {_t("Papan Cerita Warkol", "Warkol Story Board")}
          </span>
        </div>
      </div>

      {/* Input Form Post */}
      {hunger <= 10 || thirst <= 10 ? (
        <div className="p-3 bg-rose-500/10 border border-dashed border-rose-500/20 rounded-xl text-center flex flex-col gap-1.5 animate-pulse select-none">
          <p className="text-[10px] text-rose-300 font-bold uppercase tracking-widest">⚠️ {_t("Lemes kawan...", "Too weak...")}</p>
          <p className="text-[9.5px] text-stone-500 italic">{_t("Perut keroncongan / haus, silakan santap menu hidangan dulu agar bisa posting.", "Stomach growling / thirsty, please eat or drink first to post.")}</p>
        </div>
      ) : (
        <form onSubmit={handleCreatePost} className="p-3 bg-black/30 border border-white/5 rounded-xl flex flex-col gap-2.5 shadow-inner">
          <div className="flex items-start gap-2.5">
             <div className="shrink-0 mt-0.5">
               {renderUserAvatar(userName, "w-8 h-8", "ring-1 ring-white/10")}
             </div>
             <textarea
               className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-white placeholder-stone-600 font-sans resize-none min-h-[50px] py-1"
               placeholder={_t("Ceritain apa aja kawan, lagi di mana? lagi makan apa?", "Share anything, where are you? what are you eating?")}
               value={newPostText}
               onChange={(e) => setNewPostText(e.target.value)}
               required
             />
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const url = prompt(_t("Masukkan link foto (URL):", "Enter photo link (URL):"));
                  if (url) {
                    setNewPostImage(url);
                    setNewPostImageFile(null);
                  }
                }}
                className="flex items-center gap-1 px-2 py-1 bg-white/5 hover:bg-amber-950/20 border border-white/5 hover:border-amber-900/45 rounded text-[9.5px] text-stone-300 font-semibold transition-all select-none"
              >
                <Plus size={11} className="text-stone-400" />
                <span>{_t("Link Foto", "Photo Link")}</span>
              </button>
            </div>

            <button
              type="submit"
              className="py-1 px-3 bg-[#E9C46A] hover:bg-amber-400 text-neutral-950 font-black rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer shadow-md select-none active:scale-[0.98] text-center shrink-0"
            >
              <Sparkles size={11} />
              <span>Posting</span>
            </button>
          </div>

          {/* Image Attachment Preview */}
          {(newPostImage || newPostImageFile) && (
            <div className="p-1.5 bg-black/60 rounded border border-amber-500/10 flex items-center justify-between gap-3 animate-fade-in text-center">
              <div className="flex items-center gap-2 overflow-hidden">
                <img
                  src={newPostImage || (newPostImageFile ? URL.createObjectURL(newPostImageFile) : "")}
                  alt="Preview Lampiran"
                  className="w-10 h-10 object-cover rounded border border-white/10 shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100&auto=format&fit=crop&q=60";
                  }}
                />
                <span className="text-[9px] font-mono text-amber-300 truncate font-semibold">
                  📷 Tersemat: {newPostImageFile ? "File Upload" : "Link Foto"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNewPostImage("");
                  setNewPostImageFile(null);
                }}
                className="p-1 text-stone-500 hover:text-red-400 font-bold transition-colors cursor-pointer"
                title="Hapus Lampiran"
              >
                ✕
              </button>
            </div>
          )}
        </form>
      )}

      {/* Linimasa Feed Scroller */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 no-scrollbar warkop-scrollbar">
        {linimasaPosts.length === 0 ? (
          <div className="p-8 text-center text-stone-500 italic text-[11px]">
            Belum ada postingan warga, ayo jadi yang pertama berbagi cerita, kawan! ☀️
          </div>
        ) : (
          <>
            {linimasaPosts.slice(0, visiblePostsCount).map((post) => {
              const isSelf = post.author === userName;
              const isCommentsExpanded = expandedCommentsPostId === post.id;
              
              return (
                <TimelinePost 
                  key={post.id}
                  post={post}
                  userName={userName}
                  userAvatar={userAvatar}
                  isSelf={isSelf}
                  isCommentsExpanded={isCommentsExpanded}
                  setExpandedCommentsPostId={setExpandedCommentsPostId}
                  editingPostId={editingPostId}
                  setEditingPostId={setEditingPostId}
                  editingPostText={editingPostText}
                  setEditingPostText={setEditingPostText}
                  handleUpdatePost={handleUpdatePost}
                  handleDeletePost={handleDeletePost}
                  handleLikePost={handleLikePost}
                  handleCreateComment={handleCreateComment}
                  newCommentText={newCommentTexts[post.id] || ""}
                  setNewCommentText={(text) => setNewCommentTexts(prev => ({ ...prev, [post.id]: text }))}
                  hunger={hunger}
                  thirst={thirst}
                  _t={_t}
                />
              );
            })}

            {linimasaPosts.length > visiblePostsCount && (
              <div className="pt-2 pb-6 flex flex-col items-center gap-3 animate-fade-in">
                {seeMoreClicks < 5 ? (
                  <button
                    onClick={handleSeeMore}
                    className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[11px] font-bold text-stone-400 hover:text-amber-400 transition-all flex items-center gap-2 cursor-pointer active:scale-95 group"
                  >
                    <span>{_t("Lihat Lebih Banyak", "See More")}</span>
                    <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-2 px-6 py-4 bg-amber-500/5 border border-dashed border-amber-500/20 rounded-xl text-center">
                    <RefreshCw size={18} className="text-amber-500/60 mb-1" />
                    <p className="text-[11px] font-medium text-stone-400 italic">
                      {_t("Sudah terlalu jauh nongkrongnya, kawan.", "You've scrolled quite a bit, friend.")}
                    </p>
                    <p className="text-[10px] text-stone-500">
                      {_t("Silakan segarkan (refresh) halaman untuk melihat cerita terbaru dari warga.", "Please refresh the page to see the latest stories from residents.")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
