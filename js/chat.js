// ── BMS Advanced Chat Module (v2 Native - Theme Aware) ────────────────────
// WhatsApp-style interactions with full Dark Mode support and Native Interactions.

(function () {
    'use strict';

    let _activeBranchId = null;
    let _isGroupChat = false;
    let _replyingTo = null;
    let _activeMessages = [];
    let _activePins = [];
    let _longPressTimer = null;
    let _activeContextMenu = null;
    let _isSearchOpen = false;

    // ─── Entry Point ──────────────────────────────────────────────────────────
    window.renderChatModule = async function () {
        const isOwner = state.role === 'owner';
        const container = document.getElementById('mainContent');

        if (isOwner) {
            renderOwnerChat(container);
        } else {
            _isGroupChat = false;
            _activeBranchId = state.branchId;
            renderBranchChat(container);
        }
    };

    // ─── Owner (Admin) Chat UI ────────────────────────────────────────────────
    async function renderOwnerChat(container) {
        container.innerHTML = `
            <div id="chatMainContainer" class="flex flex-col h-[calc(100vh-140px)] bg-[var(--chat-bg)] rounded-[1.5rem] shadow-2xl border border-gray-200/20 dark:border-white/10 overflow-hidden animate-in fade-in zoom-in duration-500">
                <div class="flex h-full">
                    <!-- Sidebar -->
                    <div id="chatSidebar" class="w-full md:w-80 border-r border-gray-200 dark:border-white/10 flex flex-col bg-[var(--chat-sidebar)]">
                        <div class="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                            <h3 class="text-lg font-black text-[var(--text-primary)]">Chats</h3>
                            <div class="flex gap-2">
                                <button onclick="window.handleNewChat()" class="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-500 transition-all active:scale-95" title="New Chat"><i data-lucide="message-square-plus" class="w-5 h-5"></i></button>
                                <button onclick="window.toggleSidebarMenu(event)" class="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-500 transition-all active:scale-95" title="Menu"><i data-lucide="more-vertical" class="w-5 h-5"></i></button>
                            </div>
                        </div>
                        <!-- Search Bar in Sidebar -->
                        <div class="px-4 py-2 border-b border-gray-100 dark:border-white/5">
                            <div class="bg-gray-100 dark:bg-white/5 rounded-xl px-4 py-2 flex items-center gap-3 border border-transparent focus-within:border-emerald-500/30 transition-all">
                                <i data-lucide="search" class="w-3.5 h-3.5 opacity-40"></i>
                                <input type="text" placeholder="Search or start new chat" id="sidebarSearchInput" oninput="window.handleSidebarSearch(this.value)"
                                       class="bg-transparent border-none focus:ring-0 text-sm outline-none text-[var(--text-primary)] flex-1 placeholder:text-[11px] placeholder:font-bold placeholder:uppercase placeholder:tracking-wider">
                            </div>
                        </div>
                        <div class="p-4 space-y-2">
                             <button onclick="window.selectGroupChat()" 
                                    id="groupChatBtn"
                                    class="w-full flex items-center gap-3 p-4 rounded-xl transition-all hover:opacity-90 active:scale-[0.98] border border-transparent ${_isGroupChat && !_activeGroupId ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-gray-50 dark:bg-white/5 text-gray-500'} group">
                                <div class="w-12 h-12 rounded-full ${_isGroupChat && !_activeGroupId ? 'bg-white/20' : 'bg-emerald-500'} flex items-center justify-center shadow-sm">
                                    <i data-lucide="globe" class="w-6 h-6 text-white"></i>
                                </div>
                                <div class="text-left flex-1 min-w-0">
                                    <p class="text-sm font-black leading-tight ${_isGroupChat && !_activeGroupId ? 'text-white' : 'text-gray-800 dark:text-gray-200'}">Global Room</p>
                                    <p class="text-[11px] font-medium truncate ${_isGroupChat && !_activeGroupId ? 'text-white/70' : 'text-gray-400'}">Shared announcement space</p>
                                </div>
                            </button>
                            <div id="groupChatList" class="space-y-1"></div>
                        </div>
                        <div id="branchChatList" class="flex-1 overflow-y-auto space-y-0.5">
                            <div class="p-8 text-center text-gray-400 text-xs italic">Loading...</div>
                        </div>
                    </div>
                    <!-- Chat Window -->
                    <div id="chatWindow" class="flex-1 flex flex-col bg-[var(--chat-bg)] relative overflow-hidden">
                        <div class="flex-1 flex flex-col items-center justify-center text-gray-400 p-12 text-center">
                            <div class="w-24 h-24 bg-white/5 dark:bg-black/20 backdrop-blur rounded-full flex items-center justify-center mb-6 shadow-sm border border-white/10">
                                <i data-lucide="send" class="w-10 h-10 text-emerald-500 opacity-40"></i>
                            </div>
                            <h4 class="text-xl font-bold text-gray-500">BMS Communiqué</h4>
                            <p class="text-sm font-medium max-w-xs mt-3 opacity-60">Send and receive messages across branches in real-time.</p>
                            <div class="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                                <i data-lucide="lock" class="w-3 h-3"></i> End-to-end Encrypted
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Shared Dropdown -->
            <div id="globalDropdown" class="fixed hidden z-[100] bg-white dark:bg-[#1f2c33] rounded-2xl shadow-2xl py-2 w-56 border border-gray-200 dark:border-white/10 animate-in zoom-in-95 duration-150"></div>
        `;
        lucide.createIcons();
        updateBranchList();
        updateGroupList();
    }

    async function updateGroupList() {
        const list = document.getElementById('groupChatList');
        if (!list) return;

        try {
            const groups = await dbMessages.fetchGroups(state.role === 'branch' ? state.branchId : null);
            if (groups.length === 0) {
                list.innerHTML = '';
                return;
            }

            list.innerHTML = groups.map(g => {
                const isActive = _activeGroupId === g.id;
                return `
                    <button onclick="window.selectGroupChat('${g.id}')" 
                            class="w-full text-left p-3 px-4 transition-all flex items-center gap-3 group rounded-xl ${isActive ? 'bg-gray-100 dark:bg-white/5' : 'hover:bg-gray-50 dark:hover:bg-white/5'}">
                        <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-black text-xs ${isActive ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500'} transition-colors uppercase">
                            ${g.name.charAt(0)}
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-bold truncate ${isActive ? 'text-[var(--text-primary)]' : 'text-gray-500'}">${g.name}</p>
                            <p class="text-[10px] opacity-40 truncate">Group Room</p>
                        </div>
                    </button>
                `;
            }).join('');
            lucide.createIcons();
        } catch (e) {
            console.error('Failed to update group list:', e);
        }
    }

    async function updateBranchList() {
        const list = document.getElementById('branchChatList');
        if (!list) return;

        const branches = state.branches;
        const unreadCounts = await Promise.all(branches.map(async b => {
            const count = await dbMessages.getUnreadCount(b.id, 'admin');
            return { id: b.id, count };
        }));

        list.innerHTML = branches.map(b => {
            const unread = unreadCounts.find(u => u.id === b.id)?.count || 0;
            const isActive = _activeBranchId === b.id && !_isGroupChat;
            return `
                <button onclick="window.selectChatBranch('${b.id}')" 
                        class="w-full text-left p-4 transition-all flex items-center gap-4 group border-b border-gray-50 dark:border-white/5 ${isActive ? 'bg-gray-100 dark:bg-white/5' : 'hover:bg-gray-50 dark:hover:bg-white/5'}">
                    <div class="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-black text-sm ${isActive ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-500'} transition-colors uppercase">
                        ${b.name.charAt(0)}
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="flex justify-between items-center mb-1">
                            <p class="text-[15px] font-bold truncate text-[var(--text-primary)]">${b.name}</p>
                            <span class="text-[10px] text-gray-400 font-medium whitespace-nowrap">9:41 AM</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <p class="text-sm text-gray-500 dark:text-gray-400 truncate opacity-80">${b.location || 'Branch'}</p>
                            ${unread > 0 ? `<span class="bg-emerald-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-sm">${unread}</span>` : ''}
                        </div>
                    </div>
                </button>
            `;
        }).join('');
    }

    let _activeGroupId = null;

    window.selectGroupChat = function (groupId = null) {
        _isGroupChat = true;
        _activeBranchId = null;
        _activeGroupId = groupId;
        updateBranchList();
        renderConversation(null, true, groupId);
    };

    window.selectChatBranch = function (branchId) {
        _isGroupChat = false;
        _activeBranchId = branchId;
        _activeGroupId = null;
        updateBranchList();
        renderConversation(branchId, false);
    };

    // ─── Shared Conversation Renderer ─────────────────────────────────────────
    async function renderConversation(branchId, isGroup, groupId = null) {
        const chatWindow = document.getElementById('chatWindow');
        const title = isGroup ? (groupId ? 'Group' : 'Global Room') : state.branches.find(b => b.id === branchId)?.name;

        chatWindow.innerHTML = `
            <!-- Chat Header -->
            <div class="h-16 px-6 bg-[var(--chat-header)] flex items-center justify-between border-l border-gray-200 dark:border-white/5 relative z-20">
                <div class="flex items-center gap-4">
                    <button onclick="window.toggleMobileChatView('list')" class="md:hidden p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full text-gray-500 transition-all active:scale-90">
                        <i data-lucide="chevron-left" class="w-6 h-6"></i>
                    </button>
                    <div class="w-10 h-10 rounded-full ${isGroup ? 'bg-emerald-500' : 'bg-gray-400 dark:bg-white/10'} flex items-center justify-center shadow-sm">
                        <i data-lucide="${isGroup ? 'users' : 'building-2'}" class="w-5 h-5 text-white"></i>
                    </div>
                    <div>
                        <h4 class="text-[15px] font-bold text-[var(--text-primary)] leading-none">${title}</h4>
                        <div class="flex items-center gap-1.5 mt-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p class="text-[11px] text-emerald-500 font-medium tracking-tight">online</p>
                        </div>
                    </div>
                </div>
                <div class="flex gap-4 text-gray-500 dark:text-gray-400">
                    <button onclick="window.toggleSearch()" class="hover:text-emerald-500 transition-all active:scale-95"><i data-lucide="search" class="w-5 h-5"></i></button>
                    <button onclick="window.toggleHeaderMenu(event)" class="hover:text-emerald-500 transition-all active:scale-95"><i data-lucide="more-vertical" class="w-5 h-5"></i></button>
                </div>
            </div>

            <!-- Search Bar (Sub-header) -->
            <div id="searchBar" class="hidden h-14 px-6 bg-[var(--chat-input-bar)] border-b border-gray-200 dark:border-white/5 flex items-center animate-in slide-in-from-top-2">
                <div class="flex-1 flex items-center gap-3 bg-white dark:bg-[#1f2c33] px-4 py-2 rounded-xl border border-gray-200 dark:border-white/5 shadow-sm">
                    <i data-lucide="search" class="w-4 h-4 opacity-40"></i>
                    <input type="text" id="msgSearchInput" placeholder="Search in conversation" 
                           class="flex-1 bg-transparent border-none focus:ring-0 text-[14px] outline-none text-[var(--text-primary)]"
                           oninput="window.handleMsgSearch(this.value)">
                    <button onclick="window.toggleSearch()" class="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>

            <!-- Pinned Area -->
            <div id="pinsArea" class="hidden px-6 py-2 bg-[var(--chat-header)] backdrop-blur border-b border-gray-200 dark:border-white/5 flex flex-col gap-2 z-10"></div>

            <!-- Message List -->
            <div id="messageHistory" class="flex-1 overflow-y-auto p-4 md:p-8 space-y-1 bg-[var(--chat-bg)] relative scroller-custom" 
                 style="background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png'); background-blend-mode: overlay; background-size: 400px; background-attachment: fixed; opacity: 1;">
                <div class="flex flex-col items-center justify-center h-full space-y-4">
                     <div class="loading-spinner border-emerald-500 border-t-transparent shadow-sm"></div>
                </div>
            </div>

            <!-- Reply Preview -->
            <div id="replyPreview" class="hidden px-8 py-3 bg-[var(--chat-input-bar)] border-t border-gray-200 dark:border-white/10 flex items-center justify-between animate-in slide-in-from-bottom-2">
                <div class="flex items-center gap-4 border-l-4 border-emerald-500 pl-4 py-1.5 bg-black/5 dark:bg-white/5 rounded-r-xl pr-6">
                    <div class="min-w-0">
                        <p id="replyToName" class="text-[11px] font-black text-emerald-500 uppercase tracking-wider"></p>
                        <p id="replyToContent" class="text-sm text-gray-500 dark:text-gray-400 truncate italic max-w-lg"></p>
                    </div>
                </div>
                <button onclick="window.cancelReply()" class="w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-gray-400">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <!-- Input Bar -->
            <div class="p-4 bg-[var(--chat-input-bar)] flex items-end gap-3 px-6 relative z-10 border-t border-gray-200 dark:border-white/5 transition-all">
                <div class="flex gap-4 pb-2 text-gray-500 dark:text-gray-400 relative">
                    <button onclick="window.toggleEmojiPicker(event)" class="hover:text-emerald-500 transition-all active:scale-90"><i data-lucide="smile" class="w-6 h-6"></i></button>
                    <div class="relative">
                        <button onclick="window.toggleAttachmentMenu(event)" class="hover:text-emerald-500 transition-all active:scale-90" title="Add Attachment">
                            <i data-lucide="plus" class="w-6 h-6"></i>
                        </button>
                        
                        <!-- Attachment Menu Popover (Image 2 Style) -->
                        <div id="attachmentMenu" class="absolute bottom-full left-0 mb-6 hidden bg-white dark:bg-[#232d36] rounded-2xl shadow-2xl py-2 w-48 border border-gray-200 dark:border-white/10 animate-in slide-in-from-bottom-4 zoom-in-95 duration-200 z-50">
                            <div class="flex flex-col">
                                <button onclick="window.triggerFileSelect('doc')" class="w-full text-left px-4 py-3 text-[14px] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-between group transition-all">
                                    <span>Document</span>
                                    <i data-lucide="file-text" class="w-4 h-4 opacity-40 group-hover:opacity-100 transition-all"></i>
                                </button>
                                <button onclick="window.triggerFileSelect('image')" class="w-full text-left px-4 py-3 text-[14px] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-between group transition-all">
                                    <span>Photos & Videos</span>
                                    <i data-lucide="image" class="w-4 h-4 opacity-40 group-hover:opacity-100 transition-all"></i>
                                </button>
                                <button onclick="showToast('Camera feature coming soon', 'info')" class="w-full text-left px-4 py-3 text-[14px] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-between group transition-all">
                                    <span>Camera</span>
                                    <i data-lucide="camera" class="w-4 h-4 opacity-40 group-hover:opacity-100 transition-all"></i>
                                </button>
                                <div class="h-[1px] bg-gray-100 dark:bg-white/5 my-1 mx-2"></div>
                                <button onclick="showToast('Poll feature coming soon', 'info')" class="w-full text-left px-4 py-3 text-[14px] text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-between group transition-all">
                                    <span>Poll</span>
                                    <i data-lucide="bar-chart-2" class="w-4 h-4 opacity-40 group-hover:opacity-100 transition-all"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Emoji Picker Popover -->
                    <div id="emojiPicker" class="absolute bottom-full left-0 mb-4 hidden bg-white dark:bg-[#232d36] rounded-2xl shadow-2xl p-4 w-72 border border-gray-200 dark:border-white/10 animate-in slide-in-from-bottom-4 zoom-in-95 duration-200 z-50">
                        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Common Emojis</p>
                        <div class="grid grid-cols-7 gap-1">
                            ${['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '🥵', '🥶', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😻', '😼', '👍', '👎', '👋', '🙌', '👏', '🙏'].map(e => `
                                <button onclick="window.addEmoji('${e}')" class="text-xl p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all active:scale-125">${e}</button>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="flex-1 bg-white dark:bg-[#1f2c33] rounded-2xl shadow-sm border border-gray-200 dark:border-white/5 p-1 flex items-end">
                    <textarea id="chatInput" placeholder="Type a message" rows="1" required
                           class="flex-1 bg-transparent border-none px-4 py-2 text-[15px] focus:ring-0 outline-none resize-none max-h-40 leading-normal text-[var(--text-primary)] transition-all rounded-2xl"
                           oninput="window.handleChatInput(this)"
                           onkeydown="if(event.key === 'Enter' && !event.shiftKey && localStorage.getItem('chatPref_enter') !== 'false') { event.preventDefault(); window.handleChatSubmit(event); }"></textarea>
                </div>
                <div class="pb-1">
                    <button onclick="window.handleChatSubmit(event)" id="sendChatBtn"
                            class="bg-emerald-500 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-emerald-600 transition-all shadow-lg active:scale-95 flex-shrink-0">
                        <i data-lucide="mic" id="micIcon" class="w-5 h-5"></i>
                        <i data-lucide="send" id="sendIcon" class="w-5 h-5 ml-0.5 hidden"></i>
                    </button>
                </div>
            </div>
            
            <!-- Floating Menu / Context Menu (Hidden) -->
            <div id="contextMenu" class="fixed hidden z-[100] bg-[#232d36] rounded-2xl shadow-2xl p-2 w-64 border border-white/10 animate-in zoom-in-95 duration-150">
                <div class="flex justify-between px-3 py-2 border-b border-white/5 mb-2 gap-2 overflow-x-auto scroller-hidden">
                    ${['👍', '❤️', '😂', '😮', '😢', '🙏', '➕'].map(emoji => `
                        <button onclick="window.applyReaction('${emoji}')" class="text-xl hover:scale-125 transition-transform p-1 animate-in zoom-in-50">${emoji}</button>
                    `).join('')}
                </div>
                <div class="space-y-0.5">
                    <button onclick="window.execMenu('reply')" class="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 rounded-xl flex items-center justify-between group transition-colors">
                        Reply <i data-lucide="reply" class="w-4 h-4 opacity-50 group-hover:opacity-100"></i>
                    </button>
                    <button onclick="window.execMenu('copy')" class="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 rounded-xl flex items-center justify-between group transition-colors">
                        Copy <i data-lucide="copy" class="w-4 h-4 opacity-50 group-hover:opacity-100"></i>
                    </button>
                    <button onclick="window.execMenu('pin')" class="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 rounded-xl flex items-center justify-between group transition-colors">
                        Pin <i data-lucide="pin" class="w-4 h-4 opacity-50 group-hover:opacity-100"></i>
                    </button>
                    <button onclick="window.execMenu('star')" class="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-white/5 rounded-xl flex items-center justify-between group transition-colors">
                        Star <i data-lucide="star" class="w-4 h-4 opacity-50 group-hover:opacity-100"></i>
                    </button>
                    <button onclick="window.execMenu('delete')" class="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-xl flex items-center justify-between group transition-colors">
                        Delete <i data-lucide="trash-2" class="w-4 h-4 opacity-50 group-hover:opacity-100"></i>
                    </button>
                </div>
            </div>
        `;
        lucide.createIcons();
        loadHistory(branchId, isGroup);
        refreshPins();
        window.toggleMobileChatView('chat');

        // Desktop dismissal of context menu
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#contextMenu') && !e.target.closest('.msg-options')) {
                document.getElementById('contextMenu')?.classList.add('hidden');
            }
        });

        if (branchId) dbMessages.markRead(branchId, state.role);
        else if (groupId) { /* group read status logic */ }
    }

    // ─── Branch UI ────────────────────────────────────────────────────────────
    async function renderBranchChat(container) {
        container.innerHTML = `
            <div id="chatMainContainer" class="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto shadow-2xl rounded-[1.5rem] overflow-hidden border border-gray-200 dark:border-white/10 bg-[var(--chat-bg)]">
                <div class="flex h-full">
                    <!-- Sidebar (WhatsApp Style) -->
                    <div id="chatSidebar" class="w-full md:w-20 border-r border-gray-200 dark:border-white/10 flex flex-col items-center py-6 gap-6 bg-[var(--chat-sidebar)]">
                        <button onclick="window.toggleBranchChat(false)" id="dmBtn" class="w-12 h-12 rounded-full transition-all flex items-center justify-center relative shadow-sm" title="Direct Messages">
                            <i data-lucide="message-square" class="w-6 h-6"></i>
                            <div id="dmBadge" class="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full hidden border-2 border-[var(--chat-sidebar)]"></div>
                        </button>
                        <button onclick="window.toggleBranchChat(true)" id="groupBtn" class="w-12 h-12 rounded-full transition-all flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 text-gray-500" title="Global Room">
                            <i data-lucide="globe" class="w-6 h-6"></i>
                        </button>
                        
                        <!-- Groups list for branch -->
                        <div id="groupChatList" class="flex flex-col gap-4 overflow-y-auto px-2"></div>

                        <div class="mt-auto flex flex-col gap-6 items-center pb-4 text-gray-400 dark:text-gray-500">
                            <button onclick="window.toggleSidebarMenu(event)" class="hover:text-yellow-500 transition-all active:scale-95" title="Starred Messages"><i data-lucide="star" class="w-6 h-6"></i></button>
                            <button onclick="window.toggleSidebarMenu(event)" class="hover:text-emerald-500 transition-all active:scale-95" title="Archived Chats"><i data-lucide="archive" class="w-6 h-6"></i></button>
                            <button onclick="window.toggleSidebarMenu(event)" class="hover:text-emerald-500 transition-all active:scale-95" title="Chat Settings"><i data-lucide="settings" class="w-6 h-6"></i></button>
                        </div>
                    </div>
                    <!-- Chat Container -->
                    <div id="chatWindow" class="flex-1 flex flex-col bg-[var(--chat-bg)]"></div>
                </div>
            </div>
            <!-- Global Dropdown Container (Shared) -->
            <div id="globalDropdown" class="fixed hidden z-[100] bg-white dark:bg-[#1f2c33] rounded-2xl shadow-2xl py-2 w-56 border border-gray-200 dark:border-white/10 animate-in zoom-in-95 duration-150"></div>
        `;
        lucide.createIcons();
        window.toggleBranchChat(false);
        updateGroupList();
    }

    window.toggleBranchChat = function (isGroup) {
        _isGroupChat = isGroup;
        const dmBtn = document.getElementById('dmBtn');
        const groupBtn = document.getElementById('groupBtn');

        if (isGroup) {
            groupBtn?.classList.add('bg-emerald-500', 'text-white', 'shadow-lg');
            groupBtn?.classList.remove('text-gray-500', 'hover:bg-black/5', 'dark:hover:bg-white/5');
            dmBtn?.classList.add('text-gray-500', 'hover:bg-black/5', 'dark:hover:bg-white/5');
            dmBtn?.classList.remove('bg-emerald-500', 'text-white', 'shadow-lg');
            renderConversation(null, true);
        } else {
            dmBtn?.classList.add('bg-emerald-500', 'text-white', 'shadow-lg');
            dmBtn?.classList.remove('text-gray-500', 'hover:bg-black/5', 'dark:hover:bg-white/5');
            groupBtn?.classList.add('text-gray-500', 'hover:bg-black/5', 'dark:hover:bg-white/5');
            groupBtn?.classList.remove('bg-emerald-500', 'text-white', 'shadow-lg');
            renderConversation(state.branchId, false);
        }
    };

    // ─── Native Bubble Renderer ────────────────────────────────────────────────
    async function loadHistory(branchId, isGroup, groupId = null) {
        const historyDiv = document.getElementById('messageHistory');
        if (!historyDiv) return;

        try {
            const messages = await dbMessages.fetchConversation(branchId, isGroup, groupId);
            _activeMessages = messages;

            if (messages.length === 0) {
                historyDiv.innerHTML = `<div class="p-20 text-center opacity-40 italic text-sm text-[var(--text-primary)]">End-to-end encrypted.</div>`;
                return;
            }

            historyDiv.innerHTML = messages.map((msg, idx) => {
                const isMine = (state.role === 'admin' && msg.sender_role === 'admin') ||
                    (state.role === 'branch' && msg.sender_role === 'branch' && msg.branch_id === state.branchId);

                const parent = msg.parent_id ? messages.find(m => m.id === msg.parent_id) : null;
                const isNewGroup = idx === 0 || messages[idx - 1].sender_name !== msg.sender_name;

                // Reaction summary
                const reactions = msg.reactions || [];
                const reactionMap = {};
                reactions.forEach(r => reactionMap[r.emoji] = (reactionMap[r.emoji] || 0) + 1);
                const reactionHtml = Object.entries(reactionMap).map(([emoji, count]) => `
                    <div class="bg-white dark:bg-[#1f2c33] rounded-full px-1.5 py-0.5 shadow-sm border border-gray-100 dark:border-white/10 flex items-center gap-1 scale-[0.8] origin-left">
                        <span>${emoji}</span>
                        ${count > 1 ? `<span class="text-[9px] font-bold text-gray-500 dark:text-white/60">${count}</span>` : ''}
                    </div>
                `).join('');

                const attachment = msg.metadata?.attachment;
                const attachmentHtml = attachment ? renderAttachment(attachment, isMine) : '';

                return `
                    <div class="flex flex-col ${isMine ? 'items-end' : 'items-start'} ${isNewGroup ? 'pt-4' : 'pt-0.5'}" 
                         id="msg-${msg.id}">
                        
                        <div class="group relative max-w-[85%] md:max-w-[70%]">
                            <!-- Options Dropdown (Desktop) -->
                            <button onclick="window.showContextMenu(event, '${msg.id}')" 
                                    class="msg-options absolute top-1 right-1 p-1 bg-white/40 dark:bg-black/20 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 text-gray-600 dark:text-gray-300 hover:bg-white/60">
                                <i data-lucide="chevron-down" class="w-4 h-4"></i>
                            </button>

                            <div onmousedown="window.handleMessageDown(event, '${msg.id}')"
                                 onmouseup="window.handleMessageUp()"
                                 ontouchstart="window.handleMessageDown(event, '${msg.id}')"
                                 ontouchend="window.handleMessageUp()"
                                 class="relative ${isMine ?
                        'msg-bubble-mine text-white dark:text-gray-100 rounded-lg rounded-tr-none shadow-sm' :
                        'msg-bubble-other text-gray-800 dark:text-gray-200 rounded-lg rounded-tl-none shadow-sm'} px-3 py-1.5 min-w-[70px] cursor-pointer active:scale-[0.99] transition-transform">
                                
                                ${!isMine && isNewGroup && isGroup ? `<p class="text-[11px] font-black text-emerald-500 mb-0.5 tracking-tight">${msg.sender_name}</p>` : ''}
                                
                                ${parent ? `
                                    <div class="mb-1.5 overflow-hidden rounded-md border-l-4 border-emerald-500 bg-black/5 dark:bg-white/5 p-2 pr-4 flex flex-col gap-0.5 max-w-[320px]">
                                        <p class="text-[10px] font-black text-emerald-500 uppercase tracking-tight">${parent.sender_name}</p>
                                        <p class="text-xs text-gray-500 dark:text-gray-400 truncate italic leading-tight">${parent.content}</p>
                                    </div>
                                ` : ''}

                                ${attachmentHtml}

                                <div class="flex flex-wrap items-end gap-2">
                                    <p class="text-[14.5px] leading-relaxed flex-1">${msg.content}</p>
                                    <div class="flex flex-col items-end gap-0.5 pb-0.5 min-w-[50px]">
                                        <div class="flex items-center gap-1 opacity-50">
                                            <span class="text-[9px] font-bold uppercase">${new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            ${isMine ? `<i data-lucide="check-check" class="w-3.5 h-3.5 text-blue-400"></i>` : ''}
                                        </div>
                                    </div>
                                </div>

                                <!-- Floating Reactions -->
                                ${reactionHtml ? `<div class="absolute -bottom-3 ${isMine ? 'right-0' : 'left-0'} flex gap-0.5 z-10">${reactionHtml}</div>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            lucide.createIcons();
            historyDiv.scrollTop = historyDiv.scrollHeight;
        } catch (e) {
            historyDiv.innerHTML = `<div class="p-10 text-center text-red-500 text-xs">Failed to load history</div>`;
        }
    }

    function renderAttachment(att, isMine) {
        const isImage = att.type.startsWith('image/');
        const labelClass = isMine ? 'text-white' : 'text-[var(--text-primary)]';
        const subLabelClass = isMine ? 'text-white/60' : 'text-gray-500';

        if (isImage) {
            return `
                <div class="mb-2 rounded-lg overflow-hidden cursor-pointer active:scale-[0.98] transition-all" onclick="window.openAttachment('${att.url}')">
                    <img src="${att.url}" alt="${att.name}" class="max-h-60 rounded-lg object-cover w-full">
                </div>
            `;
        }

        let icon = 'file-text';
        let iconColor = 'bg-blue-500';
        if (att.type.includes('pdf')) { icon = 'file-text'; iconColor = 'bg-red-500'; }
        if (att.type.includes('word') || att.name.endsWith('.doc') || att.name.endsWith('.docx')) { icon = 'file-text'; iconColor = 'bg-blue-600'; }
        if (att.type.includes('excel') || att.name.endsWith('.xls') || att.name.endsWith('.xlsx')) { icon = 'table'; iconColor = 'bg-emerald-600'; }

        return `
            <div class="mb-2 p-2.5 bg-black/5 dark:bg-white/5 rounded-lg border border-white/10 flex items-center gap-3 cursor-pointer hover:bg-black/10 transition-all active:scale-[0.98]" onclick="window.openAttachment('${att.url}')">
                <div class="w-9 h-9 ${iconColor} text-white rounded flex items-center justify-center shadow-sm">
                    <i data-lucide="${icon}" class="w-5 h-5"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-[13px] font-bold truncate ${labelClass}">${att.name}</p>
                    <p class="text-[10px] font-black uppercase tracking-widest ${subLabelClass}">${(att.size / 1024).toFixed(1)} KB</p>
                </div>
                <i data-lucide="download" class="w-4 h-4 opacity-40"></i>
            </div>
        `;
    }

    window.openAttachment = function (url) {
        window.open(url, '_blank');
    };

    // ─── Menu & Logic ─────────────────────────────────────────────────────────
    window.showContextMenu = function (e, msgId) {
        e.preventDefault();
        e.stopPropagation();
        _activeContextMenu = _activeMessages.find(m => m.id === msgId);

        const menu = document.getElementById('contextMenu');
        menu.classList.remove('hidden');

        // Position intelligently
        const x = Math.min(e.clientX, window.innerWidth - 280);
        const y = Math.min(e.clientY, window.innerHeight - 380);

        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        lucide.createIcons();
    };

    window.execMenu = function (action) {
        if (!_activeContextMenu) return;
        const msg = _activeContextMenu;
        document.getElementById('contextMenu').classList.add('hidden');

        if (action === 'reply') window.replyToMessage(msg.id);
        if (action === 'copy') {
            navigator.clipboard.writeText(msg.content);
            showToast('Copied to clipboard');
        }
        if (action === 'pin' && state.role === 'owner') {
            window.pinMessageForBranch(msg.id, msg.branch_id);
        }
        if (action === 'star') {
            dbMessages.starMessage(msg.id, state.profile.id)
                .then(() => showToast('Message starred', 'success'))
                .catch(e => showToast('Failed to star', 'error'));
        }
        if (action === 'delete') {
            window.handleDeleteMessage(msg.id);
        }
    };

    window.handleDeleteMessage = async function (msgId) {
        const isOwner = state.role === 'owner';
        const choices = isOwner ? ['Delete for everyone', 'Delete for me', 'Cancel'] : ['Delete for me', 'Cancel'];

        const choice = await new Promise(resolve => {
            // Re-using a simple confirm or modal would be better, but let's use a themed dropdown for logic
            // For now, let's use a standard prompt/confirm to find intent
            const msg = isOwner ? "Delete for everyone (Permanent) or just for you?" : "Delete this message from your view?";
            if (isOwner) {
                if (confirm("Permanently delete for everyone? OK = Everyone, Cancel = Just for me")) resolve('everyone');
                else resolve('me');
            } else {
                if (confirm("Delete for me?")) resolve('me');
                else resolve('cancel');
            }
        });

        try {
            if (choice === 'everyone' && isOwner) {
                await dbMessages.hardDelete(msgId);
                showToast('Deleted for everyone', 'success');
            } else if (choice === 'me') {
                const userId = state.role === 'owner' ? state.profile.id : state.branchId;
                await dbMessages.softDelete(msgId, userId);
                showToast('Removed from your view');
            }
            loadHistory(_activeBranchId, _isGroupChat, _activeGroupId);
        } catch (e) {
            showToast('Failed to delete', 'error');
        }
    };

    window.applyReaction = async function (emoji) {
        if (!_activeContextMenu) return;
        const msgId = _activeContextMenu.id;
        document.getElementById('contextMenu').classList.add('hidden');

        try {
            await dbMessages.toggleReaction(msgId, emoji, { id: state.profile.id, name: state.currentUser });
            loadHistory(_activeBranchId, _isGroupChat);
            if (localStorage.getItem('chatPref_sounds') !== 'false') playSound('pop-alert');
        } catch (e) {
            showToast('Failed to react', 'error');
        }
    };

    window.handleMessageDown = function (e, msgId) {
        _longPressTimer = setTimeout(() => {
            window.showContextMenu(e, msgId);
            if (navigator.vibrate) navigator.vibrate([15]);
        }, 500);
    };

    window.handleMessageUp = function () {
        clearTimeout(_longPressTimer);
    };

    window.replyToMessage = function (msgId) {
        const msg = _activeMessages.find(m => m.id === msgId);
        if (!msg) return;

        _replyingTo = msg;
        const preview = document.getElementById('replyPreview');
        document.getElementById('replyToName').innerText = msg.sender_name;
        document.getElementById('replyToContent').innerText = msg.content;
        preview.classList.remove('hidden');
        document.getElementById('chatInput').focus();
        lucide.createIcons();
    };

    window.cancelReply = function () {
        _replyingTo = null;
        document.getElementById('replyPreview').classList.add('hidden');
    };

    window.handleChatSubmit = async function (e) {
        if (e) e.preventDefault();
        const input = document.getElementById('chatInput');
        const content = input.value.trim();
        if (!content) return;

        const payload = {
            branch_id: _activeBranchId,
            is_group: _isGroupChat,
            group_id: _activeGroupId,
            parent_id: _replyingTo?.id || null,
            sender_role: state.role,
            sender_name: state.currentUser,
            content: content,
            metadata: {
                attachment: window._pendingAttachment || null
            }
        };

        const autoPinTarget = (_isGroupChat && _replyingTo && _replyingTo.branch_id) ? _replyingTo.branch_id : null;

        input.value = '';
        input.style.height = '';
        window.cancelReply();

        try {
            const res = await dbMessages.send(payload);
            if (autoPinTarget && state.role === 'owner') {
                await dbMessages.pinForBranch(res.id, autoPinTarget);
            }
            window._pendingAttachment = null;
            loadHistory(_activeBranchId, _isGroupChat, _activeGroupId);
            if (localStorage.getItem('chatPref_sounds') !== 'false') playSound('pop-alert');
        } catch (e) {
            showToast('Failed to send', 'error');
        }
    };

    window.triggerFileSelect = function (type) {
        const input = document.getElementById('chatFileInput');
        if (type === 'image') input.accept = 'image/*,video/*';
        else if (type === 'doc') input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.txt';
        else input.accept = 'image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt';
        input.click();
        document.getElementById('attachmentMenu')?.classList.add('hidden');
    };

    window.toggleAttachmentMenu = function (e) {
        e.stopPropagation();
        const menu = document.getElementById('attachmentMenu');
        menu?.classList.toggle('hidden');

        const closeMenu = (ev) => {
            if (!ev.target.closest('#attachmentMenu')) {
                menu?.classList.add('hidden');
                document.removeEventListener('click', closeMenu);
            }
        };
        if (!menu?.classList.contains('hidden')) {
            document.addEventListener('click', closeMenu);
        }
        lucide.createIcons();
    };

    window.handleAttachment = async function (input) {
        const file = input.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            showToast('File too large (Max 10MB)', 'warning');
            input.value = '';
            return;
        }

        try {
            showToast(`Uploading ${file.name}...`, 'info');
            const att = await dbMessages.uploadFile(file);
            window._pendingAttachment = att;
            showToast('File ready to send!', 'success');

            // Visual hint in input
            const inputEl = document.getElementById('chatInput');
            if (!inputEl.value.trim()) {
                inputEl.value = `[Document: ${file.name}] `;
                inputEl.dispatchEvent(new Event('input'));
            }
            inputEl.focus();
        } catch (err) {
            showToast('Upload failed: ' + err.message, 'error');
        } finally {
            input.value = '';
        }
    };

    // ─── Pin Tracking ─────────────────────────────────────────────────────────
    window.pinMessageForBranch = async function (msgId, branchId) {
        if (!branchId || branchId === 'null') return;
        try {
            await dbMessages.pinForBranch(msgId, branchId);
            showToast('Pinned!');
        } catch (e) { }
    };

    async function refreshPins() {
        const area = document.getElementById('pinsArea');
        if (!area || state.role !== 'branch') return;

        try {
            const pins = await dbMessages.fetchPins(state.branchId);
            if (pins.length === 0) { area.classList.add('hidden'); return; }

            area.classList.remove('hidden');
            area.innerHTML = pins.slice(0, 1).map(pin => `
                <div class="flex items-center justify-between bg-white dark:bg-[#1f2c33] border-l-4 border-emerald-500 p-3 rounded-r-xl shadow-sm animate-in slide-in-from-top-2">
                    <div class="flex-1 min-w-0 pr-4">
                        <p class="text-[10px] font-black text-emerald-500 uppercase leading-none mb-1">Direct Note from Admin</p>
                        <p class="text-xs text-gray-700 dark:text-gray-300 truncate italic">"${pin.messages.content}"</p>
                    </div>
                    <button onclick="window.dismissPin('${pin.id}')" class="p-2 text-gray-400 hover:text-red-500 transition-colors">
                         <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
            `).join('');
            lucide.createIcons();
        } catch (e) { }
    }

    window.dismissPin = async function (pinId) {
        try { await dbMessages.dismissPin(pinId); refreshPins(); } catch (e) { }
    };

    window.toggleMobileChatView = function (view) {
        const container = document.getElementById('chatMainContainer');
        if (!container) return;

        if (view === 'chat') {
            container.classList.add('chat-active');
            // Hide parent app header on mobile for full screen immersion
            if (window.innerWidth <= 768) {
                document.querySelector('header')?.classList.add('md:flex', 'hidden');
            }
        } else {
            container.classList.remove('chat-active');
            document.querySelector('header')?.classList.remove('md:flex', 'hidden');
            _activeBranchId = null;
            _isGroupChat = false;
        }
    };

    window.handleSidebarSearch = function (query) {
        const q = query.toLowerCase().trim();
        const branchItems = document.querySelectorAll('#branchChatList button');
        const groupItems = document.querySelectorAll('#groupChatList button');

        branchItems.forEach(item => {
            const name = item.querySelector('p')?.innerText.toLowerCase() || '';
            item.style.display = name.includes(q) ? 'flex' : 'none';
        });

        groupItems.forEach(item => {
            const name = item.querySelector('p')?.innerText.toLowerCase() || '';
            item.style.display = name.includes(q) ? 'flex' : 'none';
        });
    };

    // ─── Realtime Logic ───────────────────────────────────────────────────────
    window.refreshChat = function (payload) {
        if (!window.state || !state.profile) return;

        if (payload.table === 'pinned_messages' && payload.new && payload.new.branch_id === state.branchId) {
            refreshPins();
            if (localStorage.getItem('chatMuted') !== 'true' && localStorage.getItem('chatPref_sounds') !== 'false') {
                playSound('notification');
            }
            return;
        }

        const isMsgTarget = (_isGroupChat && payload.new.is_group) ||
            (!_isGroupChat && !payload.new.is_group && payload.new.branch_id === _activeBranchId);

        if (isMsgTarget) {
            loadHistory(_activeBranchId, _isGroupChat);
            if (payload.new.sender_role !== state.role) {
                playSound('notification');
                if (!payload.new.is_group && !_isGroupChat) dbMessages.markRead(_activeBranchId, state.role);
            }
        } else if (state.role === 'owner') {
            updateBranchList();
        }
    };

    // ─── Interactive Features Logic ───────────────────────────────────────────
    window.handleChatInput = function (input) {
        if (!input) return;

        // Toggle mic/send
        const mic = document.getElementById('micIcon');
        const send = document.getElementById('sendIcon');
        if (input.value.trim().length > 0) {
            mic?.classList.add('hidden');
            send?.classList.remove('hidden');
        } else {
            mic?.classList.remove('hidden');
            send?.classList.add('hidden');
        }

        input.style.height = '';
        input.style.height = input.scrollHeight + 'px';
    };

    window.toggleEmojiPicker = function (e) {
        e.stopPropagation();
        const picker = document.getElementById('emojiPicker');
        picker?.classList.toggle('hidden');

        const closePicker = (ev) => {
            if (!ev.target.closest('#emojiPicker')) {
                picker?.classList.add('hidden');
                document.removeEventListener('click', closePicker);
            }
        };
        if (!picker?.classList.contains('hidden')) {
            document.addEventListener('click', closePicker);
        }
    };

    window.addEmoji = function (emoji) {
        const input = document.getElementById('chatInput');
        if (!input) return;

        const start = input.selectionStart;
        const end = input.selectionEnd;
        const val = input.value;

        // Toggle mic/send
        const mic = document.getElementById('micIcon');
        const send = document.getElementById('sendIcon');
        // Check if input will have content after adding emoji
        if ((val.substring(0, start) + emoji + val.substring(end)).trim().length > 0) {
            mic?.classList.add('hidden');
            send?.classList.remove('hidden');
        } else {
            mic?.classList.remove('hidden');
            send?.classList.add('hidden');
        }

        input.style.height = '';
        input.style.height = input.scrollHeight + 'px';
        input.value = val.substring(0, start) + emoji + val.substring(end);
        input.selectionStart = input.selectionEnd = start + emoji.length;
        input.focus();
        document.getElementById('emojiPicker')?.classList.add('hidden');
    };

    window.toggleSearch = function () {
        _isSearchOpen = !_isSearchOpen;
        const bar = document.getElementById('searchBar');
        bar?.classList.toggle('hidden');
        if (_isSearchOpen) {
            document.getElementById('msgSearchInput')?.focus();
        } else {
            loadHistory(_activeBranchId, _isGroupChat);
        }
    };

    window.handleMsgSearch = function (query) {
        if (!query.trim()) {
            loadHistory(_activeBranchId, _isGroupChat);
            return;
        }
        const filtered = _activeMessages.filter(m =>
            m.content.toLowerCase().includes(query.toLowerCase()) ||
            m.sender_name.toLowerCase().includes(query.toLowerCase())
        );
        renderFilteredMessages(filtered, query);
    };

    function renderFilteredMessages(messages, query) {
        const historyDiv = document.getElementById('messageHistory');
        if (!historyDiv) return;

        if (messages.length === 0) {
            historyDiv.innerHTML = `<div class="p-20 text-center opacity-40 italic text-sm text-[var(--text-primary)]">No messages found matching "${query}"</div>`;
            return;
        }

        historyDiv.innerHTML = messages.map(msg => {
            const isMine = (state.role === 'admin' && msg.sender_role === 'admin') ||
                (state.role === 'branch' && msg.sender_role === 'branch' && msg.branch_id === state.branchId);

            return `
                <div class="flex flex-col ${isMine ? 'items-end' : 'items-start'} pt-2">
                    <div class="px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 max-w-[80%]">
                        <p class="text-[10px] font-black text-emerald-500 mb-1">${msg.sender_name}</p>
                        <p class="text-sm text-[var(--text-primary)]">${msg.content.replace(new RegExp(query, 'gi'), match => `<mark class="bg-emerald-500/40 text-[var(--text-primary)] rounded px-0.5">${match}</mark>`)}</p>
                        <p class="text-[9px] text-gray-400 mt-1">${new Date(msg.created_at).toLocaleTimeString()}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    window.toggleHeaderMenu = function (e) {
        e.stopPropagation();
        const menuItems = [
            { label: 'Branch Details', icon: 'info' },
            { label: 'Mute Notifications', icon: 'bell-off' },
            { label: 'Clear Messages', icon: 'trash-2' },
            { label: 'Search Messages', icon: 'search' },
            { label: 'Export Chat History', icon: 'download' },
        ];
        showGlobalDropdown(e, menuItems);
    };

    window.toggleSidebarMenu = function (e) {
        e.stopPropagation();
        const menuItems = [
            { label: 'Create New Group', icon: 'users' },
            { label: 'Archived Chats', icon: 'archive' },
            { label: 'Starred Messages', icon: 'star' },
            { label: 'Chat Preferences', icon: 'settings' },
            { label: 'Privacy & Security', icon: 'shield' },
        ];
        showGlobalDropdown(e, menuItems);
    };

    window.handleNewChat = function () {
        if (state.role === 'owner') {
            openModal('addBranch');
        } else {
            showToast('Only Admins can add new chat branches', 'warning');
        }
    };

    function showGlobalDropdown(e, items) {
        const dropdown = document.getElementById('globalDropdown');
        if (!dropdown) return;

        dropdown.innerHTML = items.map(item => `
            <button onclick="window.handleChatAction('${item.label}')" class="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-between group transition-colors">
                ${item.label} <i data-lucide="${item.icon}" class="w-4 h-4 opacity-40 group-hover:opacity-100"></i>
            </button>
        `).join('');

        dropdown.classList.remove('hidden');
        lucide.createIcons();

        // Position dropdown
        const x = Math.min(e.clientX, window.innerWidth - 240);
        const y = Math.min(e.clientY, window.innerHeight - 300);
        dropdown.style.left = `${x}px`;
        dropdown.style.top = `${y}px`;

        const closeDropdown = (ev) => {
            if (!ev.target.closest('#globalDropdown')) {
                dropdown.classList.add('hidden');
                document.removeEventListener('click', closeDropdown);
            }
        };
        document.addEventListener('click', closeDropdown);
    }

    window.handleChatAction = function (label) {
        document.getElementById('globalDropdown')?.classList.add('hidden');

        switch (label) {
            case 'Branch Details':
                const branch = state.branches.find(b => b.id === _activeBranchId);
                if (branch) openModal('chatBranchInfo', branch);
                else showToast('Please select a branch first', 'warning');
                break;
            case 'Mute Notifications':
                window.toggleMute();
                break;
            case 'Clear Messages':
                window.clearChat();
                break;
            case 'Search Messages':
                window.toggleSearch();
                break;
            case 'Export Chat History':
                window.exportChat();
                break;
            case 'Chat Preferences':
                openModal('chatPreferences');
                setTimeout(() => window.syncPrefUI(), 100);
                break;
            case 'Create New Group':
                openModal('chatCreateGroup');
                break;
            case 'Archived Chats':
                openModal('chatArchivedRooms');
                break;
            case 'Starred Messages':
                window.showStarredMessages();
                break;
            case 'Privacy & Security':
                showToast('Privacy settings coming soon in v2.1', 'info');
                break;
            default:
                showToast(`${label} integration is coming soon!`);
        }
    };

    window.handleCreateChatGroup = async function (e) {
        e.preventDefault();
        const name = document.getElementById('groupName').value;
        const selectedBranches = Array.from(document.querySelectorAll('input[name="groupBranches"]:checked')).map(i => i.value);

        if (selectedBranches.length === 0) {
            showToast('Select at least one branch', 'warning');
            return;
        }

        try {
            showToast('Creating group...', 'info');
            const group = await dbMessages.createGroup(name, selectedBranches, state.profile.id);
            closeModal();
            showToast(`Group "${name}" created!`, 'success');
            window.renderChatModule(); // Full refresh to show new group
        } catch (err) {
            showToast('Failed to create group: ' + err.message, 'error');
        }
    };

    window.showStarredMessages = async function () {
        openModal('chatStarredMessages');
        const list = document.querySelector('.chat-starred-list') || document.getElementById('modalContent').querySelector('.space-y-4');
        try {
            const starred = await dbMessages.fetchStarred(state.profile.id);
            if (starred.length === 0) return;

            list.innerHTML = starred.map(s => `
                <div class="bg-white dark:bg-[#1f2c33] p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-[10px] font-black text-emerald-500 uppercase">${s.messages.sender_name}</span>
                        <span class="text-[9px] text-gray-400">${new Date(s.messages.created_at).toLocaleDateString()}</span>
                    </div>
                    <p class="text-sm text-[var(--text-primary)]">${s.messages.content}</p>
                </div>
            `).join('');
        } catch (err) {
            showToast('Failed to load starred messages', 'error');
        }
    };

    window.toggleMute = function () {
        const isMuted = localStorage.getItem('chatMuted') === 'true';
        localStorage.setItem('chatMuted', !isMuted);
        showToast(!isMuted ? 'Notifications muted' : 'Notifications enabled');
    };

    window.clearChat = function () {
        if (confirm('Are you sure you want to clear this conversation history? This action is visual-only for your current session.')) {
            const historyDiv = document.getElementById('messageHistory');
            if (historyDiv) {
                historyDiv.innerHTML = `<div class="p-20 text-center opacity-40 italic text-sm text-[var(--text-primary)]">Conversation cleared.</div>`;
            }
            showToast('Conversation cleared');
        }
    };

    window.exportChat = function () {
        if (!_activeMessages || _activeMessages.length === 0) {
            showToast('No messages to export', 'warning');
            return;
        }

        const title = _isGroupChat ? 'Global Room' : state.branches.find(b => b.id === _activeBranchId)?.name || 'Branch';
        const content = _activeMessages.map(m => `[${new Date(m.created_at).toLocaleString()}] ${m.sender_name}: ${m.content}`).join('\n');

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Chat_Export_${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Chat history exported');
    };

    window.toggleChatPref = function (key) {
        const current = localStorage.getItem(`chatPref_${key}`) === 'true';
        localStorage.setItem(`chatPref_${key}`, !current);
        window.syncPrefUI();
    };

    window.syncPrefUI = function () {
        const keys = ['sounds', 'enter'];
        keys.forEach(k => {
            const val = localStorage.getItem(`chatPref_${k}`) !== 'false'; // Default true
            const btn = document.getElementById(`pref${k.charAt(0).toUpperCase() + k.slice(1)}`);
            if (btn) {
                const dot = btn.querySelector('div');
                if (val) {
                    btn.classList.add('bg-emerald-500');
                    btn.classList.remove('bg-gray-300', 'dark:bg-white/10');
                    dot.style.left = '1.75rem';
                } else {
                    btn.classList.remove('bg-emerald-500');
                    btn.classList.add('bg-gray-300', 'dark:bg-white/10');
                    dot.style.left = '0.25rem';
                }
            }
        });
    };

})();
