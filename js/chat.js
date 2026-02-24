// ── BMS Chat Module ────────────────────────────────────────────────────────
// Handles real-time communication between Admin and Branches.

(function () {
    'use strict';

    let _activeBranchId = null;

    // ─── Branch View: Direct Line to Admin ────────────────────────────────────
    window.renderChatModule = async function () {
        const isOwner = state.role === 'owner';
        const container = document.getElementById('mainContent');

        if (isOwner) {
            renderOwnerChat(container);
        } else {
            renderBranchChat(container);
        }
    };

    // ─── Owner (Admin) Chat UI ────────────────────────────────────────────────
    async function renderOwnerChat(container) {
        container.innerHTML = `
            <div class="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="flex h-full">
                    <!-- Branch List Sidebar -->
                    <div class="w-1/3 border-r border-gray-100 flex flex-col">
                        <div class="p-4 border-b border-gray-50">
                            <h3 class="text-sm font-black uppercase tracking-widest text-gray-400">Conversations</h3>
                        </div>
                        <div id="branchChatList" class="flex-1 overflow-y-auto p-2 space-y-1">
                            <div class="p-8 text-center text-gray-400 text-xs">Loading branches...</div>
                        </div>
                    </div>
                    <!-- Chat Window -->
                    <div id="chatWindow" class="flex-1 flex flex-col bg-gray-50/30">
                        <div class="flex-1 flex items-center justify-center text-gray-400 text-sm italic">
                            Select a branch to start chatting
                        </div>
                    </div>
                </div>
            </div>
        `;

        updateBranchList();
    }

    async function updateBranchList() {
        const list = document.getElementById('branchChatList');
        if (!list) return;

        const branches = state.branches;
        if (branches.length === 0) {
            list.innerHTML = `<div class="p-8 text-center text-gray-400 text-xs">No branches found</div>`;
            return;
        }

        // Fetch unread counts for all branches
        const unreadCounts = await Promise.all(branches.map(async b => {
            const count = await dbMessages.getUnreadCount(b.id, 'admin');
            return { id: b.id, count };
        }));

        list.innerHTML = branches.map(b => {
            const unread = unreadCounts.find(u => u.id === b.id)?.count || 0;
            const isActive = _activeBranchId === b.id;
            return `
                <button onclick="window.selectChatBranch('${b.id}')" 
                        class="w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${isActive ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-gray-100 text-gray-700'}">
                    <div class="min-w-0">
                        <p class="text-sm font-bold truncate">${b.name}</p>
                        <p class="text-[10px] uppercase tracking-tighter opacity-60">${b.location || 'HQ'}</p>
                    </div>
                    ${unread > 0 ? `<span class="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">${unread}</span>` : ''}
                </button>
            `;
        }).join('');
    }

    window.selectChatBranch = function (branchId) {
        _activeBranchId = branchId;
        updateBranchList();
        renderConversation(branchId);
    };

    async function renderConversation(branchId) {
        const chatWindow = document.getElementById('chatWindow');
        const branch = state.branches.find(b => b.id === branchId);

        chatWindow.innerHTML = `
            <div class="p-4 border-b border-gray-100 bg-white flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black">
                        ${branch.name.charAt(0)}
                    </div>
                    <div>
                        <h4 class="text-sm font-black text-gray-900 leading-none">${branch.name}</h4>
                        <p class="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Branch Thread</p>
                    </div>
                </div>
            </div>
            <div id="messageHistory" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                <div class="p-10 text-center text-gray-400 italic text-xs">Loading history...</div>
            </div>
            <div class="p-4 bg-white border-t border-gray-100">
                <form onsubmit="window.handleChatSubmit(event)" class="flex gap-2">
                    <input type="text" id="chatInput" placeholder="Type a message..." required
                           class="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    <button type="submit" class="bg-indigo-600 text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-md">
                        <i data-lucide="send" class="w-5 h-5"></i>
                    </button>
                </form>
            </div>
        `;
        lucide.createIcons();
        loadHistory(branchId);
        dbMessages.markRead(branchId, 'admin');
    }

    // ─── Branch UI ────────────────────────────────────────────────────────────
    async function renderBranchChat(container) {
        container.innerHTML = `
            <div class="flex flex-col h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl mx-auto">
                <div class="p-4 border-b border-gray-100 bg-white flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                        <i data-lucide="shield-check" class="w-6 h-6"></i>
                    </div>
                    <div>
                        <h4 class="text-sm font-black text-gray-900 leading-none">Admin Support</h4>
                        <p class="text-[10px] text-emerald-500 mt-1 uppercase font-bold tracking-widest flex items-center gap-1">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Direct Line Active
                        </p>
                    </div>
                </div>
                <div id="messageHistory" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/20">
                    <div class="p-10 text-center text-gray-400 italic text-xs">Loading history...</div>
                </div>
                <div class="p-4 bg-white border-t border-gray-100">
                    <form onsubmit="window.handleChatSubmit(event)" class="flex gap-2">
                        <input type="text" id="chatInput" placeholder="Message Business Admin..." required
                               class="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                        <button type="submit" class="bg-indigo-600 text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg">
                            <i data-lucide="send" class="w-5 h-5"></i>
                        </button>
                    </form>
                </div>
            </div>
        `;
        lucide.createIcons();
        _activeBranchId = state.branchId;
        loadHistory(state.branchId);
        dbMessages.markRead(state.branchId, 'branch');
    }

    async function loadHistory(branchId) {
        const historyDiv = document.getElementById('messageHistory');
        if (!historyDiv) return;

        try {
            const messages = await dbMessages.fetchConversation(branchId);
            if (messages.length === 0) {
                historyDiv.innerHTML = `<div class="p-10 text-center text-gray-400 text-xs italic">No messages yet. Say hello!</div>`;
                return;
            }

            historyDiv.innerHTML = messages.map(msg => {
                const isMine = (state.role === 'admin' && msg.sender_role === 'admin') ||
                    (state.role === 'branch' && msg.sender_role === 'branch');

                return `
                    <div class="flex ${isMine ? 'justify-end' : 'justify-start'}">
                        <div class="max-w-[80%]">
                            <div class="${isMine ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-none'} p-3 shadow-sm">
                                <p class="text-sm">${msg.content}</p>
                            </div>
                            <p class="text-[8px] text-gray-400 mt-1 uppercase font-black ${isMine ? 'text-right' : 'text-left'}">
                                ${msg.sender_name} • ${new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                `;
            }).join('');

            // Scroll to bottom
            historyDiv.scrollTop = historyDiv.scrollHeight;
        } catch (e) {
            historyDiv.innerHTML = `<div class="p-10 text-center text-red-500 text-xs">Failed to load messages</div>`;
        }
    }

    window.handleChatSubmit = async function (e) {
        e.preventDefault();
        const input = document.getElementById('chatInput');
        const content = input.value.trim();
        if (!content || !_activeBranchId) return;

        const payload = {
            branch_id: _activeBranchId,
            sender_role: state.role,
            sender_name: state.currentUser,
            content: content
        };

        input.value = '';
        try {
            await dbMessages.send(payload);
            loadHistory(_activeBranchId);
            playSound('pop-alert');
        } catch (e) {
            showToast('Failed to send message', 'error');
        }
    };

    // Refresh on live socket updates
    window.refreshChat = function (payload) {
        if (!window.state || !state.profile) return;

        // If we are on the chat view and the message belongs to the active conversation
        if (payload.new.branch_id === _activeBranchId) {
            loadHistory(_activeBranchId);
            if (payload.new.sender_role !== state.role) {
                playSound('notification');
                dbMessages.markRead(_activeBranchId, state.role);
            }
        } else if (state.role === 'owner') {
            // Admin view: update the branch list if a message came from a different branch
            updateBranchList();
        }
    };

})();
