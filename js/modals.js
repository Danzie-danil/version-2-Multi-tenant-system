// ── Modal HTML Templates & Form Handlers ──────────────────────────────────

window.getModalHTML = function (type, data) {
    switch (type) {
        /* ── Request Attention (Branch -> Admin) ─── */
        case 'chatBranchInfo': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-8">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                        <i data-lucide="building-2" class="w-7 h-7"></i>
                    </div>
                    <div>
                        <h3 class="text-xl font-black text-gray-900 dark:text-white">${data.name}</h3>
                        <p class="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">${data.manager || 'No Manager'}</p>
                    </div>
                </div>
                <button onclick="closeModal()" class="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center text-gray-400">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="grid grid-cols-1 gap-4">
                <div class="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-transparent dark:border-white/5">
                    <div>
                        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                        <span class="text-sm font-bold text-emerald-600 capitalize">${data.status}</span>
                    </div>
                    <div class="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                </div>
                <div class="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-transparent dark:border-white/5">
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Location</p>
                    <p class="text-sm font-bold text-[var(--text-primary)]">${data.location || 'Not set'}</p>
                </div>
                <div class="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-transparent dark:border-white/5">
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Since</p>
                    <p class="text-sm font-bold text-[var(--text-primary)]">${new Date(data.created_at).toLocaleDateString()}</p>
                </div>
            </div>
            <div class="mt-8 grid grid-cols-2 gap-3">
                <button onclick="window.toggleMute()" class="p-3 bg-gray-100 dark:bg-white/5 rounded-xl font-bold text-xs hover:bg-gray-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    <i data-lucide="bell-off" class="w-4 h-4"></i> Mute Branch
                </button>
                <button onclick="window.clearChat()" class="p-3 bg-red-50 text-red-600 rounded-xl font-bold text-xs hover:bg-red-100 transition-all flex items-center justify-center gap-2">
                    <i data-lucide="trash-2" class="w-4 h-4"></i> Clear Chat
                </button>
            </div>
        </div>`;

        case 'chatParticipants': {
            const participants = data.participants || [];
            return `
            <div class="p-6">
                <div class="flex items-center justify-between mb-8">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg">
                            <i data-lucide="users" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Chat Participants</h3>
                            <p class="text-xs text-gray-500">${participants.length} members in this conversation</p>
                        </div>
                    </div>
                    <button onclick="closeModal()" class="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center text-gray-400">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
                <div class="max-h-[60vh] overflow-y-auto space-y-2 pr-2 scroller-custom">
                    ${participants.map(p => {
                const isOnline = window.onlineUsers && window.onlineUsers[p.id];
                return `
                        <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 transition-all hover:border-emerald-500/30">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-full ${isOnline ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-500'} flex items-center justify-center font-black text-xs transition-colors">
                                    ${p.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p class="text-sm font-bold text-gray-900 dark:text-white">${p.name}</p>
                                    <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">${p.role}</p>
                                </div>
                            </div>
                            <div class="flex flex-col items-end gap-1">
                                <div class="flex items-center gap-2">
                                    <span class="w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300 dark:bg-white/10'}"></span>
                                    <span class="text-[10px] font-black ${isOnline ? 'text-emerald-500' : 'text-gray-400'} uppercase">${isOnline ? 'Online' : 'Offline'}</span>
                                </div>
                                ${isOnline ? `<p class="text-[9px] text-emerald-500/60 font-medium">Currently active</p>` : ''}
                            </div>
                        </div>
                        `;
            }).join('')}
                </div>
                <button onclick="closeModal()" class="w-full mt-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
                    Close Details
                </button>
            </div>`;
        }

        case 'chatPreferences': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-8">
                <h3 class="text-xl font-black text-gray-900 dark:text-white">Chat Preferences</h3>
                <button onclick="closeModal()" class="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center text-gray-400">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="space-y-6">
                <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent dark:border-white/5">
                    <div>
                        <p class="text-sm font-bold text-gray-900 dark:text-white">Chat Sounds</p>
                        <p class="text-xs text-gray-500">Play alert on new messages</p>
                    </div>
                    <button id="prefSounds" onclick="window.toggleChatPref('sounds')" class="w-12 h-6 bg-emerald-500 rounded-full relative transition-all shadow-inner">
                        <div class="absolute top-1 left-7 w-4 h-4 bg-white rounded-full shadow-sm transition-all"></div>
                    </button>
                </div>
                <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent dark:border-white/5">
                    <div>
                        <p class="text-sm font-bold text-gray-900 dark:text-white">Enter to Send</p>
                        <p class="text-xs text-gray-500">Use Enter key to send message</p>
                    </div>
                    <button id="prefEnter" onclick="window.toggleChatPref('enter')" class="w-12 h-6 bg-emerald-500 rounded-full relative transition-all shadow-inner">
                        <div class="absolute top-1 left-7 w-4 h-4 bg-white rounded-full shadow-sm transition-all"></div>
                    </button>
                </div>
                <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent dark:border-white/5">
                    <div>
                        <p class="text-sm font-bold text-gray-900 dark:text-white">Read Receipts</p>
                        <p class="text-xs text-gray-500">Show when you've read messages</p>
                    </div>
                    <button class="w-12 h-6 bg-emerald-500 rounded-full relative transition-all opacity-50 cursor-not-allowed">
                        <div class="absolute top-1 left-7 w-4 h-4 bg-white rounded-full shadow-sm transition-all"></div>
                    </button>
                </div>
            </div>
            <p class="mt-8 text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">End-to-End Encrypted</p>
        </div>`;

        case 'chatCreateGroup': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-8">
                <h3 class="text-xl font-black text-gray-900 dark:text-white">Create Group Room</h3>
                <button onclick="closeModal()" class="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center text-gray-400">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="window.handleCreateChatGroup(event)" class="space-y-6">
                <div class="flex justify-center mb-4">
                    <div class="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center shadow-inner cursor-pointer hover:scale-105 transition-all">
                        <i data-lucide="camera" class="w-8 h-8"></i>
                    </div>
                </div>
                <div>
                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Group Name</label>
                    <input type="text" id="groupName" required placeholder="Project Alpha, HQ Connect..." class="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none">
                </div>
                <div>
                    <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Add Branches</label>
                    <div class="max-h-48 overflow-y-auto space-y-2 p-2 bg-gray-50 dark:bg-white/5 rounded-2xl border border-transparent dark:border-white/5">
                        ${state.branches.map(b => `
                            <label class="flex items-center justify-between p-3 hover:bg-white/10 rounded-xl cursor-pointer transition-colors group">
                                <span class="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-emerald-500">${b.name}</span>
                                <input type="checkbox" name="groupBranches" value="${b.id}" class="w-5 h-5 rounded-lg border-gray-300 text-emerald-500 focus:ring-emerald-500">
                            </label>
                        `).join('')}
                    </div>
                </div>
                <button type="submit" class="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                    Create Room
                </button>
            </form>
        </div>`;

        case 'chatStarredMessages': return `
        <div class="p-0">
            <div class="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <h3 class="text-xl font-black text-gray-900 dark:text-white">Starred Messages</h3>
                <button onclick="closeModal()" class="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center text-gray-400">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="p-6 max-h-[500px] overflow-y-auto space-y-4 bg-gray-50/50 dark:bg-[#0b141a]">
                <div class="flex flex-col items-center justify-center py-20 text-center opacity-40">
                    <i data-lucide="star" class="w-12 h-12 mb-4"></i>
                    <p class="text-sm font-medium">No starred messages yet.</p>
                </div>
            </div>
        </div>`;

        case 'chatArchivedRooms': return `
        <div class="p-0">
            <div class="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <h3 class="text-xl font-black text-gray-900 dark:text-white">Archived Chats</h3>
                <button onclick="closeModal()" class="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-center text-gray-400">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="p-6 max-h-[500px] overflow-y-auto space-y-4 bg-gray-50/50 dark:bg-[#0b141a]">
                <div class="flex flex-col items-center justify-center py-20 text-center opacity-40">
                    <i data-lucide="archive" class="w-12 h-12 mb-4"></i>
                    <p class="text-sm font-medium">Your archived chats will appear here.</p>
                </div>
            </div>
        </div>`;
        case 'chatBranchInfo': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-8">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                        <i data-lucide="building-2" class="w-7 h-7"></i>
                    </div>
                    <div>
                        <h3 class="text-xl font-black text-gray-900 dark:text-white">${data.name}</h3>
                        <p class="text-xs text-emerald-500 font-bold uppercase tracking-widest">${data.location || 'Main Office'}</p>
                    </div>
                </div>
                <button onclick="closeModal()" class="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-8">
                <div class="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                    <p class="text-[10px] text-gray-400 uppercase font-black mb-1">Weekly Sales</p>
                    <p class="text-lg font-bold text-gray-900 dark:text-white">Kes 42,500</p>
                </div>
                <div class="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                    <p class="text-[10px] text-gray-400 uppercase font-black mb-1">Performance</p>
                    <p class="text-lg font-bold text-emerald-500">+12.5%</p>
                </div>
            </div>

            <div class="space-y-4">
                <div class="flex items-center gap-4 p-4 border border-gray-100 dark:border-white/5 rounded-2xl group hover:border-emerald-500/30 transition-colors">
                    <div class="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center">
                        <i data-lucide="phone" class="w-5 h-5"></i>
                    </div>
                    <div class="flex-1">
                        <p class="text-[10px] text-gray-400 uppercase font-black">Contact Number</p>
                        <p class="text-sm font-bold text-gray-800 dark:text-gray-200">${data.contact_number || '+254 7XX XXX XXX'}</p>
                    </div>
                </div>
                <div class="flex items-center gap-4 p-4 border border-gray-100 dark:border-white/5 rounded-2xl group hover:border-emerald-500/30 transition-colors">
                    <div class="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center">
                        <i data-lucide="mail" class="w-5 h-5"></i>
                    </div>
                    <div class="flex-1">
                        <p class="text-[10px] text-gray-400 uppercase font-black">Branch Email</p>
                        <p class="text-sm font-bold text-gray-800 dark:text-gray-200">${data.login_id}@bms.com</p>
                    </div>
                </div>
            </div>

            <button onclick="closeModal()" class="w-full mt-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                Close Profile
            </button>
        </div>`;

        case 'chatPreferences': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-8">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg">
                        <i data-lucide="settings" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Chat Preferences</h3>
                        <p class="text-xs text-gray-500">Customize your messaging experience</p>
                    </div>
                </div>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <div class="space-y-2">
                <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                    <div>
                        <p class="text-sm font-bold text-gray-800 dark:text-gray-200">Message Sounds</p>
                        <p class="text-[11px] text-gray-500">Play alert on new messages</p>
                    </div>
                    <button id="prefSounds" onclick="window.toggleChatPref('sounds')" class="w-12 h-6 bg-emerald-500 rounded-full relative transition-colors">
                        <div class="w-4 h-4 bg-white rounded-full absolute top-1 left-7 shadow-sm transition-all transform pointer-events-none"></div>
                    </button>
                </div>

                <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                    <div>
                        <p class="text-sm font-bold text-gray-800 dark:text-gray-200">Enter to Send</p>
                        <p class="text-[11px] text-gray-500">Send message when pressing Enter</p>
                    </div>
                    <button id="prefEnter" onclick="window.toggleChatPref('enter')" class="w-12 h-6 bg-emerald-500 rounded-full relative transition-colors">
                        <div class="w-4 h-4 bg-white rounded-full absolute top-1 left-7 shadow-sm transition-all transform pointer-events-none"></div>
                    </button>
                </div>

                <div class="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl mt-4">
                    <p class="text-[10px] text-red-500 uppercase font-bold mb-2">Danger Zone</p>
                    <button onclick="window.handleChatAction('Clear Messages')" class="w-full py-3 bg-red-500 hover:bg-red-600 text-white text-xs font-black rounded-xl transition-all active:scale-95">
                        Clear All Conversations
                    </button>
                </div>
            </div>
        </div>`;

        case 'requestAttention': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                        <i data-lucide="message-square" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-gray-900">Request Attention</h3>
                        <p class="text-xs text-gray-500 font-medium">Message for Approval concerning this ${data.type}</p>
                    </div>
                </div>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleRequestAttention(event)" class="space-y-4">
                <input type="hidden" id="reqType" value="${data.type}">
                <input type="hidden" id="reqRelatedId" value="${data.id}">
                <input type="hidden" id="reqSummary" value="${data.summary}">
                
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                    <p class="text-[10px] text-gray-500 uppercase font-bold mb-1">Related to</p>
                    <p class="text-sm font-semibold text-gray-800">${data.summary}</p>
                </div>

                <div>
                    <label for="reqSubject" class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input type="text" id="reqSubject" required class="form-input" placeholder="What's this about?">
                </div>
                <div>
                    <label for="reqPriority" class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select id="reqPriority" class="form-input">
                        <option value="low">Low - General Feedback</option>
                        <option value="medium" selected>Medium - Needs Review</option>
                        <option value="high">High - Immediate Attention</option>
                    </select>
                </div>
                <div>
                    <label for="reqMessage" class="block text-sm font-medium text-gray-700 mb-1">Your Message / Suggestion</label>
                    <textarea id="reqMessage" required rows="4" class="form-input" placeholder="Explain your proposal or concern..."></textarea>
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Request Approval</button>
                </div>
            </form>
        </div>`;


        /* ── Assign Task (Owner) ─────────────────── */
        case 'assignTask': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Assign New Task</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleAssignTask(event)" class="space-y-4">
                <div>
                    <label for="taskBranch" class="block text-sm font-medium text-gray-700 mb-1">Assign to Branch</label>
                    <select id="taskBranch" class="form-input">
                        ${state.branches.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for="taskTitle" class="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                    <input type="text" id="taskTitle" required class="form-input" placeholder="Enter task title">
                </div>
                <div>
                    <label for="taskDesc" class="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                    <textarea id="taskDesc" rows="2" class="form-input" placeholder="Add details..."></textarea>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label for="taskPriority" class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select id="taskPriority" class="form-input">
                            <option value="low">Low</option>
                            <option value="medium" selected>Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div>
                        <label for="taskDeadline" class="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                        <input type="date" id="taskDeadline" required class="form-input">
                    </div>
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Assign Task</button>
                </div>
            </form>
        </div>`;

        /* ── Add Sale (Branch) ───────────────────── */
        case 'addSale': {
            const inventory = data || []; // Expect inventory array passed as data

            // Helper to generate options
            const productOptions = inventory.map(item => `
                <option value="${item.id}" data-price="${item.price}" data-name="${item.name}">
                    ${item.name} (${item.quantity} in stock) - ${fmt.currency(item.price)}
                </option>
            `).join('');

            return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Record New Sale</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleAddSale(event)" class="space-y-4">
                <div>
                    <label for="saleCustomer" class="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <input type="text" id="saleCustomer" class="form-input" placeholder="Walk-in Customer">
                </div>
                
                <div class="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                    <div>
                        <label for="saleProduct" class="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
                        <div class="flex gap-2">
                            <select id="saleProduct" class="form-input flex-1" onchange="updateSaleTotal()">
                                <option value="" disabled selected>Select a product...</option>
                                ${productOptions}
                            </select>
                            <button type="button" onclick="refreshSaleProducts()" class="p-2 text-gray-500 hover:text-indigo-600 border border-gray-300 rounded-lg flex items-center justify-center min-w-[38px] min-h-[38px]" title="Refresh Products">
                                <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label for="saleQty" class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input type="text" inputmode="decimal" id="saleQty" value="1" class="form-input number-format" oninput="updateSaleTotal()">
                        </div>
                        <div>
                            <label for="saleAmount" class="block text-sm font-medium text-gray-700 mb-1">Total Amount ($)</label>
                            <input type="text" inputmode="decimal" id="saleAmount" required class="form-input number-format font-bold text-emerald-600" placeholder="0.00">
                        </div>
                    </div>
                </div>

                <div>
                    <label for="salePayment" class="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <select id="salePayment" class="form-input">
                        <option value="cash">Cash</option>
                        <option value="card">Credit Card</option>
                        <option value="transfer">Bank Transfer</option>
                        <option value="mobile">Mobile Money</option>
                    </select>
                </div>

                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary btn-success justify-center">Record Sale</button>
                </div>
            </form>

        </div>`;
        }

        /* ── Add Expense (Branch) ────────────────── */
        case 'addExpense': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Add Expense</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleAddExpense(event)" class="space-y-4">
                <div>
                    <label for="expenseCategory" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select id="expenseCategory" class="form-input">
                        <option value="supplies">Supplies</option>
                        <option value="utilities">Utilities</option>
                        <option value="salary">Salary</option>
                        <option value="rent">Rent</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="marketing">Marketing</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div>
                    <label for="expenseDesc" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input type="text" id="expenseDesc" required class="form-input" placeholder="Enter description">
                </div>
                <div>
                    <label for="expenseAmount" class="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                    <input type="text" inputmode="decimal" id="expenseAmount" required class="form-input number-format" placeholder="0">
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary btn-danger justify-center">Add Expense</button>
                </div>
            </form>
        </div>`;

        /* ── Add Customer (Branch) ───────────────── */
        case 'addCustomer': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Add New Customer</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleAddCustomer(event)" class="space-y-4">
                <div>
                    <label for="customerName" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" id="customerName" required class="form-input" placeholder="Enter full name">
                </div>
                <div>
                    <label for="customerPhone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" id="customerPhone" class="form-input" placeholder="+1 (555) 000-0000">
                </div>
                <div>
                    <label for="customerEmail" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" id="customerEmail" class="form-input" placeholder="customer@example.com">
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Add Customer</button>
                </div>
            </form>
        </div>`;

        /* ── Reset Branch PIN (Owner) ────────────── */
        case 'resetPin': {
            const branch = state.branches.find(b => b.id === data);
            if (!branch) return null;
            return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Reset Branch PIN</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-3">
                <i data-lucide="alert-triangle" class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"></i>
                <p class="text-sm text-yellow-800">You are resetting the PIN for <strong>${branch.name}</strong>. The branch will need to use the new PIN to log in.</p>
            </div>
            <form onsubmit="handleResetPin(event, '${data}')" class="space-y-4">
                <div>
                    <label for="newPin" class="block text-sm font-medium text-gray-700 mb-1">New 6-Digit PIN</label>
                    <div class="relative">
                        <input type="password" id="newPin" required maxlength="6" pattern="[0-9]{6}" class="form-input text-center tracking-widest pr-10" placeholder="••••••">
                        <button type="button" onclick="togglePasswordVisibility('newPin', this)"
                            class="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none">
                            <i data-lucide="eye" class="w-4 h-4 text-gray-400"></i>
                        </button>
                    </div>
                </div>
                <div>
                    <label for="confirmPin" class="block text-sm font-medium text-gray-700 mb-1">Confirm PIN</label>
                    <div class="relative">
                        <input type="password" id="confirmPin" required maxlength="6" pattern="[0-9]{6}" class="form-input text-center tracking-widest pr-10" placeholder="••••••">
                        <button type="button" onclick="togglePasswordVisibility('confirmPin', this)"
                            class="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none">
                            <i data-lucide="eye" class="w-4 h-4 text-gray-400"></i>
                        </button>
                    </div>
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Reset PIN</button>
                </div>
            </form>
        </div>`;
        }

        /* ── Add Branch (Owner) ─────────────────── */
        case 'addBranch':
            // Default to Owner's chosen global currency
            const defCurr = (state.profile && state.profile.currency) ? state.profile.currency : 'USD';

            return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Add New Branch</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleAddBranch(event)" class="space-y-4">
                <div>
                    <label for="branchName" class="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                    <input type="text" id="branchName" required class="form-input" placeholder="e.g. Westside Branch">
                </div>
                <div>
                    <label for="branchLocation" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input type="text" id="branchLocation" class="form-input" placeholder="e.g. 123 Main St">
                </div>
                <div>
                    <label for="branchManager" class="block text-sm font-medium text-gray-700 mb-1">Manager Name</label>
                    <input type="text" id="branchManager" class="form-input" placeholder="Manager's full name">
                </div>
                <div>
                    <label for="branchOwnerEmail" class="block text-sm font-medium text-gray-700 mb-1">Admin Owner Email (for App Login)</label>
                    <input type="email" id="branchOwnerEmail" required class="form-input" placeholder="admin@example.com" autocomplete="email">
                    <p class="text-xs text-gray-400 mt-1">Branch will use this email alongside their Name & PIN to log in.</p>
                </div>
                <div>
                    <label for="branchPin" class="block text-sm font-medium text-gray-700 mb-1">Initial PIN (6 digits)</label>
                    <div class="relative">
                        <input type="password" id="branchPin" required maxlength="6" pattern="[0-9]{6}" class="form-input text-center tracking-widest pr-10" placeholder="••••••">
                        <button type="button" onclick="togglePasswordVisibility('branchPin', this)"
                            class="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none">
                            <i data-lucide="eye" class="w-4 h-4 text-gray-400"></i>
                        </button>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="branchCurrency" class="block text-sm font-medium text-gray-700 mb-1">Branch Currency</label>
                        <select id="branchCurrency" class="form-input w-full">
                            <option value="USD" ${defCurr === 'USD' ? 'selected' : ''}>USD ($)</option>
                            <option value="EUR" ${defCurr === 'EUR' ? 'selected' : ''}>EUR (€)</option>
                            <option value="GBP" ${defCurr === 'GBP' ? 'selected' : ''}>GBP (£)</option>
                            <option value="KES" ${defCurr === 'KES' ? 'selected' : ''}>KES (KSh)</option>
                            <option value="TZS" ${defCurr === 'TZS' ? 'selected' : ''}>TZS (TSh)</option>
                            <option value="NGN" ${defCurr === 'NGN' ? 'selected' : ''}>NGN (₦)</option>
                            <option value="UGX" ${defCurr === 'UGX' ? 'selected' : ''}>UGX (USh)</option>
                            <option value="ZAR" ${defCurr === 'ZAR' ? 'selected' : ''}>ZAR (R)</option>
                            <option value="INR" ${defCurr === 'INR' ? 'selected' : ''}>INR (₹)</option>
                        </select>
                    </div>
                    <div>
                        <label for="branchTarget" class="block text-sm font-medium text-gray-700 mb-1">Sales Target</label>
                        <input type="text" inputmode="decimal" id="branchTarget" required class="form-input number-format" placeholder="15000">
                    </div>
                </div>
                <div class="flex gap-3 pt-4">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Create Branch</button>
                </div>
            </form>
        </div>`;

        /* ── Edit Branch (Owner) ─────────────────── */
        case 'editBranch':
            // Provide a fallback if branch lacks a currency
            const defaultEditCurr = data.currency || (state.profile?.currency || 'USD');
            return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Edit Branch Settings</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleEditBranch(event, '${data.id}')" class="space-y-4">
                <div>
                    <label for="editBranchName" class="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                    <input type="text" id="editBranchName" value="${data.name}" required class="form-input">
                </div>
                <div>
                    <label for="editBranchLocation" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input type="text" id="editBranchLocation" value="${data.location || ''}" class="form-input">
                </div>
                <div>
                    <label for="editBranchManager" class="block text-sm font-medium text-gray-700 mb-1">Manager Name</label>
                    <input type="text" id="editBranchManager" value="${data.manager || ''}" class="form-input">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="editBranchCurrency" class="block text-sm font-medium text-gray-700 mb-1">Branch Currency</label>
                        <select id="editBranchCurrency" class="form-input w-full">
                            <option value="USD" ${defaultEditCurr === 'USD' ? 'selected' : ''}>USD ($)</option>
                            <option value="EUR" ${defaultEditCurr === 'EUR' ? 'selected' : ''}>EUR (€)</option>
                            <option value="GBP" ${defaultEditCurr === 'GBP' ? 'selected' : ''}>GBP (£)</option>
                            <option value="KES" ${defaultEditCurr === 'KES' ? 'selected' : ''}>KES (KSh)</option>
                            <option value="TZS" ${defaultEditCurr === 'TZS' ? 'selected' : ''}>TZS (TSh)</option>
                            <option value="NGN" ${defaultEditCurr === 'NGN' ? 'selected' : ''}>NGN (₦)</option>
                            <option value="UGX" ${defaultEditCurr === 'UGX' ? 'selected' : ''}>UGX (USh)</option>
                            <option value="ZAR" ${defaultEditCurr === 'ZAR' ? 'selected' : ''}>ZAR (R)</option>
                            <option value="INR" ${defaultEditCurr === 'INR' ? 'selected' : ''}>INR (₹)</option>
                        </select>
                    </div>
                    <div>
                        <label for="editBranchTarget" class="block text-sm font-medium text-gray-700 mb-1">Sales Target ($)</label>
                        <input type="text" inputmode="decimal" id="editBranchTarget" value="${data.target}" required class="form-input number-format">
                    </div>
                </div>
                <div class="flex gap-3 pt-4">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Save Changes</button>
                </div>
            </form>
        </div>`;

        /* ── Add Note (Branch) ───────────────────── */
        case 'addNote': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Add Note</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleAddNote(event)" class="space-y-4">
                <div>
                    <label for="noteTitle" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input type="text" id="noteTitle" required class="form-input" placeholder="Note title">
                </div>
                <div>
                    <label for="noteContent" class="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea id="noteContent" required rows="5" class="form-input" placeholder="Write your note..."></textarea>
                </div>
                <div>
                    <label for="noteTag" class="block text-sm font-medium text-gray-700 mb-1">Tag</label>
                    <select id="noteTag" class="form-input">
                        <option value="general">General</option>
                        <option value="important">Important</option>
                        <option value="reminder">Reminder</option>
                        <option value="incident">Incident</option>
                    </select>
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Save Note</button>
                </div>
            </form>
        </div>`;

        /* ── Add Loan/Income (Branch) ────────────── */
        case 'addLoan': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Record Loan / Income</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleAddLoan(event)" class="space-y-4">
                <div>
                    <label for="loanType" class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select id="loanType" class="form-input">
                        <option value="income">Other Income</option>
                        <option value="loan_given">Loan Given</option>
                        <option value="loan_received">Loan Received</option>
                        <option value="repayment">Repayment Received</option>
                    </select>
                </div>
                <div>
                    <label for="loanParty" class="block text-sm font-medium text-gray-700 mb-1">Party (Name)</label>
                    <input type="text" id="loanParty" class="form-input" placeholder="Customer or entity name">
                </div>
                <div>
                    <label for="loanAmount" class="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                    <input type="text" inputmode="decimal" id="loanAmount" required class="form-input number-format" placeholder="0">
                </div>
                <div>
                    <label for="loanNotes" class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea id="loanNotes" rows="2" class="form-input" placeholder="Additional details..."></textarea>
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Save Record</button>
                </div>
            </form>
        </div>`;

        /* ── Add Inventory Item (Request Approval OR Direct if allowed) ─── */
        case 'addInventoryItem': {
            const canAddDirect = window.branchCanDo && branchCanDo('inventory_add');
            return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h3 class="text-xl font-bold text-gray-900">${canAddDirect ? 'Add New Stock' : 'Request New Stock'}</h3>
                    <p class="text-xs font-medium ${canAddDirect ? 'text-emerald-600' : 'text-gray-500'}">
                        ${canAddDirect ? '✅ Allowed — will be added directly' : 'Additions require admin approval'}
                    </p>
                </div>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleAddInventoryItem(event)" class="space-y-4">
                <div class="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 mb-4">
                    <p class="text-[10px] text-blue-600 uppercase font-black tracking-wider mb-2">Item Information</p>
                    <div class="space-y-3">
                        <div>
                            <label for="itemName" class="block text-sm font-bold text-gray-700 mb-1">Item Name</label>
                            <input type="text" id="itemName" required class="form-input" placeholder="e.g. Product A">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label for="itemSku" class="block text-sm font-bold text-gray-700 mb-1">SKU</label>
                                <input type="text" id="itemSku" class="form-input" placeholder="PRD-001" value="${data && data.suggestedSku ? data.suggestedSku : ''}">
                            </div>
                            <div>
                                <label for="itemCategory" class="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                <select id="itemCategory" class="form-input">
                                    <option value="General">General</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Clothing">Clothing</option>
                                    <option value="Groceries">Groceries</option>
                                    <option value="Home &amp; Garden">Home &amp; Garden</option>
                                    <option value="Health &amp; Beauty">Health &amp; Beauty</option>
                                    <option value="Stationery">Stationery</option>
                                    <option value="Services">Services</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 mb-4">
                    <p class="text-[10px] text-amber-600 uppercase font-black tracking-wider mb-2">Purchase &amp; Supplier Details</p>
                    <div class="space-y-3">
                        <div>
                            <label for="itemSupplier" class="block text-sm font-bold text-gray-700 mb-1">Supplier Name</label>
                            <input type="text" id="itemSupplier" required class="form-input text-amber-900" placeholder="e.g. Acme Corp">
                        </div>
                        <div class="grid grid-cols-3 gap-3">
                            <div class="col-span-1">
                                <label for="itemQty" class="block text-sm font-bold text-gray-700 mb-1">Qty</label>
                                <input type="text" inputmode="decimal" id="itemQty" required class="form-input number-format" placeholder="0">
                            </div>
                            <div class="col-span-1">
                                <label for="itemCost" class="block text-sm font-bold text-gray-700 mb-1">Unit Cost</label>
                                <input type="text" inputmode="decimal" id="itemCost" required class="form-input number-format font-bold text-amber-600" placeholder="0.00">
                            </div>
                            <div class="col-span-1">
                                <label for="itemPrice" class="block text-sm font-bold text-gray-700 mb-1">Sale Price</label>
                                <input type="text" inputmode="decimal" id="itemPrice" required class="form-input number-format font-bold text-emerald-600" placeholder="0.00">
                            </div>
                        </div>
                        <div>
                            <label for="itemMinThreshold" class="block text-sm font-bold text-gray-700 mb-1">Min. Alert Threshold</label>
                            <input type="text" inputmode="decimal" id="itemMinThreshold" required class="form-input number-format" placeholder="10">
                        </div>
                    </div>
                </div>

                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 ${canAddDirect ? 'bg-emerald-600 hover:bg-emerald-700' : 'btn-primary'} text-white px-4 py-2 rounded-lg font-black justify-center">${canAddDirect ? 'Add to Inventory' : 'Submit for Approval'}</button>
                </div>
            </form>
        </div>`;
        }

        /* ── Restock Stock (Direct OR Approval depending on preference) ───── */
        case 'restockStock': {
            const canRestockDirect = window.branchCanDo && branchCanDo('inventory_update');
            return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h3 class="text-xl font-bold text-gray-900">${canRestockDirect ? 'Restock Item' : 'Request Stock Addition'}</h3>
                    <p class="text-xs font-medium ${canRestockDirect ? 'text-emerald-600' : 'text-gray-500'}">${data.name} (SKU: ${data.sku || 'N/A'}) ${canRestockDirect ? '— ✅ Allowed directly' : ''}</p>
                </div>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleRestockStock(event, '${data.id}')" class="space-y-4">
                <input type="hidden" id="restockName" value="${data.name}">
                
                <div class="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 mb-4">
                    <p class="text-[10px] text-amber-600 uppercase font-black tracking-wider mb-2">Purchase & Supplier Details</p>
                    <div class="space-y-3">
                        <div>
                            <label for="restockSupplier" class="block text-sm font-bold text-gray-700 mb-1">Supplier Name</label>
                            <input type="text" id="restockSupplier" required class="form-input text-amber-900" placeholder="e.g. Acme Corp">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label for="restockQty" class="block text-sm font-bold text-gray-700 mb-1">Quantity to Add</label>
                                <input type="text" inputmode="decimal" id="restockQty" required class="form-input number-format" placeholder="0">
                            </div>
                            <div>
                                <label for="restockCost" class="block text-sm font-bold text-gray-700 mb-1">Unit Cost</label>
                                <input type="text" inputmode="decimal" id="restockCost" required class="form-input number-format font-bold text-amber-600" placeholder="0.00">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 ${canRestockDirect ? 'bg-emerald-600 hover:bg-emerald-700' : 'btn-primary'} text-white px-4 py-2 rounded-lg font-black justify-center">${canRestockDirect ? 'Restock Now' : 'Submit Request'}</button>
                </div>
            </form>
        </div>`;
        }

        /* ── Edit General Request (Branch) ─── */
        case 'editGeneralRequest': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                        <i data-lucide="edit-3" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-gray-900">Edit Request</h3>
                        <p class="text-xs text-gray-500 font-medium truncate w-48">${data.subject}</p>
                    </div>
                </div>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleEditGeneralRequest(event, '${data.id}')" class="space-y-4">
                <div>
                    <label for="editReqSubject" class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input type="text" id="editReqSubject" required class="form-input" value="${data.subject}">
                </div>
                <div>
                    <label for="editReqPriority" class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select id="editReqPriority" class="form-input">
                        <option value="low" ${data.priority === 'low' ? 'selected' : ''}>Low - General Feedback</option>
                        <option value="medium" ${data.priority === 'medium' ? 'selected' : ''}>Medium - Needs Review</option>
                        <option value="high" ${data.priority === 'high' ? 'selected' : ''}>High - Immediate Attention</option>
                    </select>
                </div>
                <div>
                    <label for="editReqMessage" class="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
                    <textarea id="editReqMessage" required rows="4" class="form-input">${data.message}</textarea>
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Update Request</button>
                </div>
            </form>
        </div>`;

        /* ── Edit Inventory Add Request (Branch) ─── */
        case 'editInventoryAddRequest': {
            const meta = data.metadata || {};
            return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h3 class="text-xl font-bold text-gray-900">Edit Stock Request</h3>
                    <p class="text-xs text-gray-500 font-medium">Update proposed item details</p>
                </div>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleEditInventoryAddRequest(event, '${data.id}')" class="space-y-4">
                <div class="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 mb-4">
                    <p class="text-[10px] text-blue-600 uppercase font-black tracking-wider mb-2">Item Information</p>
                    <div class="space-y-3">
                        <div>
                            <label for="editItemNameAdd" class="block text-sm font-bold text-gray-700 mb-1">Item Name</label>
                            <input type="text" id="editItemNameAdd" required class="form-input" value="${meta.name || ''}">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label for="editItemSkuAdd" class="block text-sm font-bold text-gray-700 mb-1">SKU</label>
                                <input type="text" id="editItemSkuAdd" class="form-input" value="${meta.sku || ''}">
                            </div>
                            <div>
                                <label for="editItemCategoryAdd" class="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                <select id="editItemCategoryAdd" class="form-input">
                                    <option value="General" ${meta.category === 'General' ? 'selected' : ''}>General</option>
                                    <option value="Electronics" ${meta.category === 'Electronics' ? 'selected' : ''}>Electronics</option>
                                    <option value="Clothing" ${meta.category === 'Clothing' ? 'selected' : ''}>Clothing</option>
                                    <option value="Groceries" ${meta.category === 'Groceries' ? 'selected' : ''}>Groceries</option>
                                    <option value="Home & Garden" ${meta.category === 'Home & Garden' ? 'selected' : ''}>Home & Garden</option>
                                    <option value="Health & Beauty" ${meta.category === 'Health & Beauty' ? 'selected' : ''}>Health & Beauty</option>
                                    <option value="Stationery" ${meta.category === 'Stationery' ? 'selected' : ''}>Stationery</option>
                                    <option value="Services" ${meta.category === 'Services' ? 'selected' : ''}>Services</option>
                                    <option value="Other" ${meta.category === 'Other' ? 'selected' : ''}>Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 mb-4">
                    <p class="text-[10px] text-amber-600 uppercase font-black tracking-wider mb-2">Purchase & Supplier Details</p>
                    <div class="space-y-3">
                        <div>
                            <label for="editItemSupplierAdd" class="block text-sm font-bold text-gray-700 mb-1">Supplier Name</label>
                            <input type="text" id="editItemSupplierAdd" required class="form-input text-amber-900" value="${meta.supplier || ''}">
                        </div>
                        <div class="grid grid-cols-3 gap-3">
                            <div class="col-span-1">
                                <label for="editItemQtyAdd" class="block text-sm font-bold text-gray-700 mb-1">Qty</label>
                                <input type="text" inputmode="decimal" id="editItemQtyAdd" required class="form-input number-format" value="${meta.quantity !== undefined ? meta.quantity : ''}">
                            </div>
                            <div class="col-span-1">
                                <label for="editItemCostAdd" class="block text-sm font-bold text-gray-700 mb-1">Unit Cost</label>
                                <input type="text" inputmode="decimal" id="editItemCostAdd" required class="form-input number-format font-bold text-amber-600" value="${meta.cost_price !== undefined ? meta.cost_price : ''}">
                            </div>
                            <div class="col-span-1">
                                <label for="editItemPriceAdd" class="block text-sm font-bold text-gray-700 mb-1">Sale Price</label>
                                <input type="text" inputmode="decimal" id="editItemPriceAdd" required class="form-input number-format font-bold text-emerald-600" value="${meta.price !== undefined ? meta.price : ''}">
                            </div>
                        </div>
                        <div>
                            <label for="editItemMinThresholdAdd" class="block text-sm font-bold text-gray-700 mb-1">Min. Alert Threshold</label>
                            <input type="text" inputmode="decimal" id="editItemMinThresholdAdd" required class="form-input number-format" value="${meta.min_threshold !== undefined ? meta.min_threshold : ''}">
                        </div>
                    </div>
                </div>

                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center font-black">Update Request</button>
                </div>
            </form>
        </div>`;
        }

        /* ── Edit Restock Request (Branch) ───────── */
        case 'editRestockRequest': {
            const meta = data.metadata || {};
            return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h3 class="text-xl font-bold text-gray-900">Edit Restock Request</h3>
                    <p class="text-xs text-gray-500 font-medium">${meta.name || ''} (SKU: ${meta.sku || 'N/A'})</p>
                </div>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleEditRestockRequest(event, '${data.id}')" class="space-y-4">
                <input type="hidden" id="editRestockName" value="${meta.name || ''}">
                <input type="hidden" id="editRestockInvId" value="${meta.inventory_id || ''}">
                
                <div class="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 mb-4">
                    <p class="text-[10px] text-amber-600 uppercase font-black tracking-wider mb-2">Purchase & Supplier Details</p>
                    <div class="space-y-3">
                        <div>
                            <label for="editRestockSupplier" class="block text-sm font-bold text-gray-700 mb-1">Supplier Name</label>
                            <input type="text" id="editRestockSupplier" required class="form-input text-amber-900" value="${meta.supplier || ''}">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label for="editRestockQty" class="block text-sm font-bold text-gray-700 mb-1">Quantity to Add</label>
                                <input type="text" inputmode="decimal" id="editRestockQty" required class="form-input number-format" value="${meta.quantity !== undefined ? meta.quantity : ''}">
                            </div>
                            <div>
                                <label for="editRestockCost" class="block text-sm font-bold text-gray-700 mb-1">Unit Cost</label>
                                <input type="text" inputmode="decimal" id="editRestockCost" required class="form-input number-format font-bold text-amber-600" value="${meta.cost_price !== undefined ? meta.cost_price : ''}">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center font-black">Update Request</button>
                </div>
            </form>
        </div>`;
        }

        /* ── Edit Sale ───────────────────────────── */
        case 'editSale': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Edit Sale</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleEditSale(event, '${data.id}')" class="space-y-4">
                <div>
                    <label for="editSaleCustomer" class="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <input type="text" id="editSaleCustomer" value="${data.customer}" class="form-input">
                </div>
                <div>
                    <label for="editSaleItems" class="block text-sm font-medium text-gray-700 mb-1">Items / Description</label>
                    <input type="text" id="editSaleItems" value="${data.items || ''}" class="form-input">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label for="editSaleAmount" class="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                        <input type="text" inputmode="decimal" id="editSaleAmount" value="${data.amount}" required class="form-input number-format">
                    </div>
                    <div>
                        <label for="editSalePayment" class="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                        <select id="editSalePayment" class="form-input">
                            <option value="cash" ${data.payment === 'cash' ? 'selected' : ''}>Cash</option>
                            <option value="card" ${data.payment === 'card' ? 'selected' : ''}>Credit Card</option>
                            <option value="transfer" ${data.payment === 'transfer' ? 'selected' : ''}>Bank Transfer</option>
                            <option value="mobile" ${data.payment === 'mobile' ? 'selected' : ''}>Mobile Money</option>
                        </select>
                    </div>
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Update Sale</button>
                </div>
            </form>
        </div>`;

        /* ── Edit Inventory Item ─────────────────── */
        case 'editInventoryItem': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Edit Item</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleEditInventoryItem(event, '${data.id}')" class="space-y-4">
                <div>
                    <label for="editItemName" class="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input type="text" id="editItemName" value="${data.name}" required class="form-input">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label for="editItemSku" class="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                        <input type="text" id="editItemSku" value="${data.sku || ''}" class="form-input">
                    </div>
                    <div>
                        <label for="editItemCategory" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select id="editItemCategory" class="form-input">
                            <option value="General" ${data.category === 'General' ? 'selected' : ''}>General</option>
                            <option value="Electronics" ${data.category === 'Electronics' ? 'selected' : ''}>Electronics</option>
                            <option value="Clothing" ${data.category === 'Clothing' ? 'selected' : ''}>Clothing</option>
                            <option value="Groceries" ${data.category === 'Groceries' ? 'selected' : ''}>Groceries</option>
                            <option value="Home & Garden" ${data.category === 'Home & Garden' ? 'selected' : ''}>Home & Garden</option>
                            <option value="Health & Beauty" ${data.category === 'Health & Beauty' ? 'selected' : ''}>Health & Beauty</option>
                            <option value="Stationery" ${data.category === 'Stationery' ? 'selected' : ''}>Stationery</option>
                            <option value="Services" ${data.category === 'Services' ? 'selected' : ''}>Services</option>
                            <option value="Other" ${data.category === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label for="editItemPrice" class="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                        <input type="text" inputmode="decimal" id="editItemPrice" value="${data.price}" required class="form-input number-format">
                    </div>
                    <div>
                        <label for="editItemQty" class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input type="text" inputmode="decimal" id="editItemQty" value="${data.quantity}" required class="form-input number-format">
                    </div>
                </div>
                <div class="pt-2">
                    <label for="editItemMinThreshold" class="block text-sm font-medium text-gray-700 mb-1">Min. Threshold</label>
                    <input type="text" inputmode="decimal" id="editItemMinThreshold" value="${data.min_threshold}" required class="form-input number-format">
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Update Item</button>
                </div>
            </form>
        </div>`;

        /* ── Edit Note ───────────────────────────── */
        case 'editNote': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Edit Note</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleEditNote(event, '${data.id}')" class="space-y-4">
                <div>
                    <label for="editNoteTitle" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input type="text" id="editNoteTitle" value="${data.title}" required class="form-input">
                </div>
                <div>
                    <label for="editNoteContent" class="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea id="editNoteContent" required rows="5" class="form-input">${data.content}</textarea>
                </div>
                <div>
                    <label for="editNoteTag" class="block text-sm font-medium text-gray-700 mb-1">Tag</label>
                    <select id="editNoteTag" class="form-input">
                        <option value="general" ${data.tag === 'general' ? 'selected' : ''}>General</option>
                        <option value="important" ${data.tag === 'important' ? 'selected' : ''}>Important</option>
                        <option value="reminder" ${data.tag === 'reminder' ? 'selected' : ''}>Reminder</option>
                        <option value="incident" ${data.tag === 'incident' ? 'selected' : ''}>Incident</option>
                    </select>
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Update Note</button>
                </div>
            </form>
        </div>`;

        /* ── Edit Expense ────────────────────────── */
        case 'editExpense': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Edit Expense</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleEditExpense(event, '${data.id}')" class="space-y-4">
                <div>
                    <label for="editExpenseCategory" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select id="editExpenseCategory" class="form-input">
                        <option value="supplies" ${data.category === 'supplies' ? 'selected' : ''}>Supplies</option>
                        <option value="utilities" ${data.category === 'utilities' ? 'selected' : ''}>Utilities</option>
                        <option value="salary" ${data.category === 'salary' ? 'selected' : ''}>Salary</option>
                        <option value="rent" ${data.category === 'rent' ? 'selected' : ''}>Rent</option>
                        <option value="maintenance" ${data.category === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                        <option value="marketing" ${data.category === 'marketing' ? 'selected' : ''}>Marketing</option>
                        <option value="other" ${data.category === 'other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div>
                    <label for="editExpenseDesc" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input type="text" id="editExpenseDesc" value="${data.description}" required class="form-input">
                </div>
                <div>
                    <label for="editExpenseAmount" class="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                    <input type="text" inputmode="decimal" id="editExpenseAmount" value="${data.amount}" required class="form-input number-format">
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary btn-danger justify-center">Update Expense</button>
                </div>
            </form>
        </div>`;

        case 'editCustomer': return _getEditCustomerHTML(data);
        case 'editLoan': return _getEditLoanHTML(data);

        /* ── Detail Views ────────────────────────── */
        case 'saleDetails': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Sale Details</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="space-y-3">
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                    <p class="text-[10px] text-gray-500 uppercase font-bold">Customer</p>
                    <p class="text-sm font-semibold">${data.customer || 'Walk-in'}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                    <p class="text-[10px] text-gray-500 uppercase font-bold">Revenue</p>
                    <p class="text-sm font-black text-emerald-600">${fmt.currency(data.amount)}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                    <p class="text-[10px] text-gray-500 uppercase font-bold">Est. Profit</p>
                    <p class="text-sm font-black text-indigo-600">${data.profit !== undefined ? fmt.currency(data.profit) : '—'}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                    <p class="text-[10px] text-gray-500 uppercase font-bold">Items / Description</p>
                    <p class="text-sm font-medium text-gray-800">${data.items || 'N/A'}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                    <p class="text-[10px] text-gray-500 uppercase font-bold">Payment</p>
                    <p class="text-sm font-semibold capitalize text-gray-700">${data.payment}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                    <p class="text-[10px] text-gray-500 uppercase font-bold">Date & Time</p>
                    <p class="text-[11px] font-medium text-gray-600">${new Date(data.created_at).toLocaleString()}</p>
                </div>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-8">
                <button onclick="openEditModal('editSale', '${data.id}')" class="flex items-center justify-center gap-2 p-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors">
                    <i data-lucide="edit-2" class="w-4 h-4"></i> Edit
                </button>
                <button onclick="showReceiptDialog('${encodeURIComponent(JSON.stringify(data))}')" class="flex items-center justify-center gap-2 p-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-colors">
                    <i data-lucide="download" class="w-4 h-4"></i> Receipt
                </button>
                <button onclick="openRequestModal('sale', '${data.id}', 'Sale: ${data.customer || 'Walk-in'} - ${fmt.currency(data.amount)}')" class="flex items-center justify-center gap-2 p-2.5 bg-amber-50 text-amber-700 rounded-xl font-bold text-xs hover:bg-amber-100 transition-colors">
                    <i data-lucide="message-square" class="w-4 h-4"></i> Request
                </button>
                <button onclick="confirmDelete('sale', '${data.id}')" class="flex items-center justify-center gap-2 p-2.5 bg-red-50 text-red-700 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4"></i> Delete
                </button>
            </div>
        </div>`;

        case 'inventoryDetails': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Product Details</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="space-y-3">
                <div class="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mb-2">
                    <h4 class="text-lg font-bold text-indigo-900 mb-1">${data.name}</h4>
                    <p class="text-xs text-indigo-600 font-medium">SKU: ${data.sku || 'N/A'}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl flex justify-between items-center border border-gray-100">
                    <p class="text-[10px] text-gray-500 uppercase font-bold">Category</p>
                    <p class="text-sm font-semibold">${data.category || 'General'}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl flex justify-between items-center border border-gray-100">
                    <p class="text-[10px] text-gray-500 uppercase font-bold">Unit Price</p>
                    <p class="text-sm font-bold text-gray-900">${fmt.currency(data.price)}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl flex justify-between items-center border border-gray-100">
                    <p class="text-[10px] text-gray-500 uppercase font-bold">In Stock</p>
                    <p class="text-sm font-bold ${data.quantity <= data.min_threshold ? 'text-red-600' : 'text-emerald-600'}">${data.quantity} units</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl flex justify-between items-center border border-gray-100">
                    <p class="text-[10px] text-gray-500 uppercase font-bold">Min Threshold</p>
                    <p class="text-sm font-semibold">${data.min_threshold} units</p>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-2 mt-8">
                <button onclick="openEditModal('editInventoryItem', '${data.id}')" class="flex items-center justify-center gap-2 p-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors">
                    <i data-lucide="edit-2" class="w-4 h-4"></i> Edit Product
                </button>
                <button onclick="openModal('restockStock', ${JSON.stringify(data).replace(/"/g, '&quot;')})" class="flex items-center justify-center gap-2 p-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-colors">
                    <i data-lucide="plus-circle" class="w-4 h-4"></i> Restock Stock
                </button>
                <button onclick="openInventoryTagModal('${data.id}', false)" class="flex items-center justify-center gap-2 p-2.5 bg-amber-50 text-amber-700 rounded-xl font-bold text-xs hover:bg-amber-100 transition-colors">
                    <i data-lucide="tag" class="w-4 h-4"></i> Tags
                </button>
                <button onclick="openRequestModal('inventory', '${data.id}', 'Item: ${data.name} (SKU: ${data.sku || 'N/A'})')" class="flex items-center justify-center gap-2 p-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs hover:bg-blue-100 transition-colors">
                    <i data-lucide="message-square" class="w-4 h-4"></i> Request Attention
                </button>
                <button onclick="confirmDelete('inventory', '${data.id}', '${data.name}')" class="flex items-center justify-center gap-2 p-2.5 bg-red-50 text-red-700 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors col-span-2">
                    <i data-lucide="trash-2" class="w-4 h-4"></i> Delete Product
                </button>
            </div>
        </div>`;

        case 'expenseDetails': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Expense Details</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="space-y-3">
                <div class="bg-red-50 p-4 rounded-2xl border border-red-100 mb-2">
                    <p class="text-[10px] text-red-600 uppercase font-bold mb-1">Total Amount</p>
                    <p class="text-2xl font-black text-red-700">${fmt.currency(data.amount)}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3">Category</p>
                    <p class="text-sm font-semibold capitalize w-2/3">${data.category}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-start text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3 pt-0.5">Description</p>
                    <p class="text-sm w-2/3">${data.description || 'N/A'}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3">Date recorded</p>
                    <p class="text-xs w-2/3">${new Date(data.created_at).toLocaleDateString()} at ${new Date(data.created_at).toLocaleTimeString()}</p>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-2 mt-8">
                <button onclick="openEditModal('editExpense', '${data.id}')" class="flex items-center justify-center gap-2 p-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors">
                    <i data-lucide="edit-2" class="w-4 h-4"></i> Edit
                </button>
                <button onclick="openRequestModal('expense', '${data.id}', 'Expense: ${data.description || 'N/A'} - ${fmt.currency(data.amount)}')" class="flex items-center justify-center gap-2 p-2.5 bg-amber-50 text-amber-700 rounded-xl font-bold text-xs hover:bg-amber-100 transition-colors">
                    <i data-lucide="message-square" class="w-4 h-4"></i> Request
                </button>
                <button onclick="confirmDelete('expense', '${data.id}', '${data.description}')" class="flex items-center justify-center gap-2 p-2.5 bg-red-50 text-red-700 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4"></i> Delete
                </button>
            </div>
        </div>`;

        case 'customerDetails': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Customer Profile</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="space-y-3">
                <div class="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center mb-2">
                    <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i data-lucide="user" class="w-8 h-8"></i>
                    </div>
                    <h4 class="text-lg font-bold text-blue-900 mb-1">${data.name}</h4>
                    <p class="text-xs text-blue-600 font-medium">${data.customer_id || 'ID: ' + data.id.slice(0, 8)}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3">Phone</p>
                    <p class="text-sm font-semibold w-2/3">${data.phone || 'N/A'}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3">Email</p>
                    <p class="text-sm font-semibold truncate w-2/3" title="${data.email || ''}">${data.email || 'N/A'}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-start text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3 pt-0.5">Notes</p>
                    <p class="text-xs font-semibold italic text-gray-400 w-2/3">Integration pending...</p>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-2 mt-8">
                <button onclick="openEditModal('editCustomer', '${data.id}')" class="flex items-center justify-center gap-2 p-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors">
                    <i data-lucide="edit-2" class="w-4 h-4"></i> Edit
                </button>
                <button onclick="openRequestModal('customer', '${data.id}', 'Customer: ${data.name}')" class="flex items-center justify-center gap-2 p-2.5 bg-amber-50 text-amber-700 rounded-xl font-bold text-xs hover:bg-amber-100 transition-colors">
                    <i data-lucide="message-square" class="w-4 h-4"></i> Request
                </button>
                <button onclick="confirmDelete('customer', '${data.id}', '${data.name}')" class="flex items-center justify-center gap-2 p-2.5 bg-red-50 text-red-700 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4"></i> Remove
                </button>
            </div>
        </div>`;

        case 'noteDetails': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Note Details</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="space-y-3">
                <div class="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-center mb-2">
                    <h4 class="text-lg font-bold text-amber-900 mb-1">${data.title}</h4>
                    <span class="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">${data.tag || 'General'}</span>
                </div>
                <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[100px]">
                    <p class="text-[10px] text-gray-500 uppercase font-bold mb-2">Content</p>
                    <p class="text-sm text-gray-700 whitespace-pre-wrap">${data.content}</p>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3 mt-8">
                <button onclick="openEditModal('editNote', '${data.id}')" class="flex items-center justify-center gap-2 p-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors">
                    <i data-lucide="edit-2" class="w-4 h-4"></i> Edit Note
                </button>
                <button onclick="confirmDelete('note', '${data.id}', '${data.title}')" class="flex items-center justify-center gap-2 p-2.5 bg-red-50 text-red-700 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4"></i> Delete Note
                </button>
            </div>
        </div>`;

        case 'loanDetails': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Transaction Record</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="space-y-3">
                <div class="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center mb-2">
                    <p class="text-[10px] text-emerald-600 uppercase font-bold mb-1">${data.type.replace('_', ' ')}</p>
                    <p class="text-2xl font-black text-emerald-700">${fmt.currency(data.amount)}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3">Party</p>
                    <p class="text-sm font-semibold w-2/3">${data.party || 'Anonymous'}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3">Date</p>
                    <p class="text-sm font-semibold w-2/3">${fmt.date(data.created_at)}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-start text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3 pt-0.5">Notes</p>
                    <p class="text-xs text-gray-600 italic w-2/3">${data.notes || 'No additional notes provided.'}</p>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3 mt-8">
                <button onclick="openEditModal('editLoan', '${data.id}')" class="flex items-center justify-center gap-2 p-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors">
                    <i data-lucide="edit-2" class="w-4 h-4"></i> Edit Record
                </button>
                <button onclick="confirmDelete('loan', '${data.id}', 'this record')" class="flex items-center justify-center gap-2 p-2.5 bg-red-50 text-red-700 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4"></i> Delete Record
                </button>
            </div>
        </div>`;

        case 'branchDetails': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Branch Details</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="space-y-3">
                <div class="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 text-center mb-2">
                    <h4 class="text-xl font-bold text-indigo-900 mb-1">${data.name}</h4>
                    <p class="text-sm text-indigo-600 font-medium">
                        <i data-lucide="map-pin" class="w-3.5 h-3.5 inline mr-1"></i>${data.location || 'No location set'}
                    </p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3">Manager</p>
                    <p class="text-sm font-semibold w-2/3">${data.manager || '—'}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3">Status</p>
                    <div class="w-2/3 flex justify-end">
                        <span class="badge ${data.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}">${data.status}</span>
                    </div>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3">Target</p>
                    <p class="text-lg font-bold text-gray-900 w-2/3">${fmt.currency(data.target)}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3">Currency</p>
                    <p class="text-sm font-semibold uppercase w-2/3">${data.currency || 'Not set'}</p>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-2 mt-4">
                <button onclick='openModal("editBranch", ${JSON.stringify(data).replace(/'/g, "&apos;")})' class="flex items-center justify-center gap-2 p-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors">
                    <i data-lucide="settings" class="w-4 h-4"></i> Settings
                </button>
                <button onclick="openModal('resetPin','${data.id}')" class="flex items-center justify-center gap-2 p-2.5 bg-violet-50 text-violet-700 rounded-xl font-bold text-xs hover:bg-violet-100 transition-colors">
                    <i data-lucide="key" class="w-4 h-4"></i> PIN
                </button>
            </div>
            <button onclick='openBranchPreferencesModal(${JSON.stringify(data).replace(/'/g, "&apos;")})' class="w-full mt-2 flex items-center justify-center gap-2 p-2.5 bg-amber-50 text-amber-700 rounded-xl font-bold text-xs hover:bg-amber-100 transition-colors border border-amber-100">
                <i data-lucide="toggle-left" class="w-4 h-4"></i> Branch Preferences &amp; Allowlist
            </button>
            <button onclick="deleteBranchRow('${data.id}', '${data.name}')" class="w-full mt-2 flex items-center justify-center gap-2 p-2.5 bg-red-50 text-red-700 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors">
                <i data-lucide="trash-2" class="w-4 h-4"></i> Delete Branch
            </button>
        </div>`;


        /* ── Branch Preferences / Action Allowlist (Owner Sets Per-Branch) ─── */
        case 'branchPreferences': {
            const prefs = data.preferences || {};
            const ACTIONS = [
                {
                    key: 'inventory_add',
                    label: 'Add New Stock',
                    desc: 'Branch can add new inventory items directly without approval',
                    icon: 'package-plus',
                    color: 'indigo'
                },
                {
                    key: 'inventory_update',
                    label: 'Restock Items',
                    desc: 'Branch can restock / increase quantities directly without approval',
                    icon: 'refresh-ccw',
                    color: 'violet'
                },
                {
                    key: 'expenses_add',
                    label: 'Add Expenses',
                    desc: 'Branch can record expenses without requiring approval',
                    icon: 'receipt',
                    color: 'rose'
                },
                {
                    key: 'sales_add',
                    label: 'Record Sales',
                    desc: 'Branch can record sales directly (default: allowed)',
                    icon: 'shopping-cart',
                    color: 'emerald'
                },
                {
                    key: 'customers_add',
                    label: 'Add Customers',
                    desc: 'Branch can add new customers directly',
                    icon: 'user-plus',
                    color: 'cyan'
                },
                {
                    key: 'loans_add',
                    label: 'Record Loans / Income',
                    desc: 'Branch can record loans and other income directly',
                    icon: 'landmark',
                    color: 'amber'
                }
            ];

            const colorMap = {
                indigo: { on: 'bg-indigo-500', ring: 'ring-indigo-200', badge: 'bg-indigo-100 text-indigo-700', icon: 'bg-indigo-50 text-indigo-600' },
                violet: { on: 'bg-violet-500', ring: 'ring-violet-200', badge: 'bg-violet-100 text-violet-700', icon: 'bg-violet-50 text-violet-600' },
                rose: { on: 'bg-rose-500', ring: 'ring-rose-200', badge: 'bg-rose-100 text-rose-700', icon: 'bg-rose-50 text-rose-600' },
                emerald: { on: 'bg-emerald-500', ring: 'ring-emerald-200', badge: 'bg-emerald-100 text-emerald-700', icon: 'bg-emerald-50 text-emerald-600' },
                cyan: { on: 'bg-cyan-500', ring: 'ring-cyan-200', badge: 'bg-cyan-100 text-cyan-700', icon: 'bg-cyan-50 text-cyan-600' },
                amber: { on: 'bg-amber-500', ring: 'ring-amber-200', badge: 'bg-amber-100 text-amber-700', icon: 'bg-amber-50 text-amber-600' }
            };

            return `
            <div class="p-6">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
                            <i data-lucide="sliders-horizontal" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-gray-900">Branch Preferences</h3>
                            <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest">${data.name}</p>
                        </div>
                    </div>
                    <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>

                <div class="bg-amber-50/70 border border-amber-100 rounded-xl p-3 mb-5 flex items-start gap-2">
                    <i data-lucide="info" class="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5"></i>
                    <p class="text-xs text-amber-800 font-medium">Toggle which actions this branch can perform <strong>directly</strong> without requiring admin approval. Off = requires approval (default).</p>
                </div>

                <div class="space-y-3" id="prefActionList">
                    ${ACTIONS.map(act => {
                const isOn = prefs[act.key] === true;
                const c = colorMap[act.color];
                return `
                        <div class="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow" id="pref-row-${act.key}">
                            <div class="flex items-center gap-3 flex-1 min-w-0">
                                <div class="w-9 h-9 ${c.icon} rounded-xl flex items-center justify-center flex-shrink-0">
                                    <i data-lucide="${act.icon}" class="w-4.5 h-4.5"></i>
                                </div>
                                <div class="min-w-0">
                                    <p class="text-sm font-bold text-gray-900 leading-tight">${act.label}</p>
                                    <p class="text-[10px] text-gray-400 font-medium leading-tight mt-0.5 truncate">${act.desc}</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 flex-shrink-0 ml-3">
                                <span class="text-[9px] font-black uppercase tracking-widest ${isOn ? c.badge : 'bg-gray-100 text-gray-400'}" id="pref-badge-${act.key}">
                                    ${isOn ? 'Allowed' : 'Approval'}
                                </span>
                                <button
                                    type="button"
                                    id="pref-toggle-${act.key}"
                                    data-key="${act.key}"
                                    data-on="${isOn ? '1' : '0'}"
                                    data-color-on="${c.on}"
                                    data-color-badge-on="${c.badge}"
                                    onclick="toggleBranchPrefUI(this)"
                                    class="relative w-12 h-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 ${isOn ? c.on + ' ' + c.ring : 'bg-gray-200'}"
                                    aria-checked="${isOn}"
                                >
                                    <span class="absolute top-1 transition-all duration-200 w-4 h-4 bg-white rounded-full shadow-sm ${isOn ? 'left-7' : 'left-1'}"></span>
                                </button>
                            </div>
                        </div>`;
            }).join('')}
                </div>

                <div class="flex gap-3 mt-6">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl font-bold hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="button" onclick="handleSaveBranchPreferences('${data.id}')" class="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-100 active:scale-95 transition-all">
                        Save Preferences
                    </button>
                </div>
            </div>`;
        }

        case 'taskDetails': {
            const comments = data._comments || [];
            const isOwner = window.state && state.role === 'owner';

            if (isOwner) {
                /* ── ADMIN VIEW ─────────────────────────────────────────── */
                const statusOpts = ['pending', 'in_progress', 'completed'].map(s =>
                    `<option value="${s}" ${data.status === s ? 'selected' : ''}>${s.replace('_', ' ')}</option>`
                ).join('');

                const commentThread = comments.length === 0
                    ? `<div class="text-center py-4 text-xs text-gray-400 italic">No reminders sent yet. Send one below.</div>`
                    : comments.map(c => {
                        const isAdmin = c.sender_role === 'owner';
                        return `
                        <div class="flex ${isAdmin ? 'justify-end' : 'justify-start'} mb-2">
                            <div class="max-w-[80%] ${isAdmin
                                ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm'
                                : 'bg-gray-100 text-gray-800 rounded-2xl rounded-tl-sm'
                            } px-4 py-2.5 shadow-sm">
                                <p class="text-[10px] font-bold uppercase tracking-widest mb-1 ${isAdmin ? 'text-indigo-200' : 'text-gray-500'}">
                                    ${isAdmin ? '👤 You' : `🏪 ${c.sender_name || 'Branch'}`}
                                </p>
                                <p class="text-sm leading-snug">${c.message}</p>
                                <p class="text-[9px] mt-1 ${isAdmin ? 'text-indigo-300' : 'text-gray-400'}">${fmt.dateTime(c.created_at)}</p>
                            </div>
                        </div>`;
                    }).join('');

                return `
                <div class="p-5 flex flex-col max-h-[90vh]">
                    <!-- Header -->
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex items-center gap-3 min-w-0">
                            <div class="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <i data-lucide="clipboard-list" class="w-5 h-5 text-indigo-600"></i>
                            </div>
                            <div class="min-w-0">
                                <h3 class="text-base font-black text-gray-900 leading-tight truncate">${data.title}</h3>
                                <p class="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">
                                    <i data-lucide="building-2" class="w-3 h-3 inline mr-0.5"></i>
                                    ${data.branch?.name || 'Branch'}
                                </p>
                            </div>
                        </div>
                        <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 flex-shrink-0 ml-2">
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                    </div>

                    <!-- Task Meta -->
                    <div class="grid grid-cols-3 gap-2 mb-4">
                        <div class="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                            <p class="text-[9px] text-gray-400 uppercase font-black mb-1">Priority</p>
                            ${priorityBadge(data.priority)}
                        </div>
                        <div class="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                            <p class="text-[9px] text-gray-400 uppercase font-black mb-1">Status</p>
                            ${statusBadge(data.status)}
                        </div>
                        <div class="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                            <p class="text-[9px] text-gray-400 uppercase font-black mb-1">Deadline</p>
                            <p class="text-[11px] font-bold text-red-600">${data.deadline ? fmt.date(data.deadline) : '—'}</p>
                        </div>
                    </div>

                    <!-- Instructions -->
                    ${data.description ? `
                    <div class="bg-blue-50/50 border border-blue-100 rounded-xl p-3 mb-4">
                        <p class="text-[9px] text-blue-500 uppercase font-black mb-1">Instructions</p>
                        <p class="text-sm text-gray-700 leading-relaxed">${data.description}</p>
                    </div>` : ''}

                    <!-- Admin Actions Row -->
                    <div class="grid grid-cols-2 gap-2 mb-4">
                        <div class="flex flex-col gap-1">
                            <label class="text-[9px] text-gray-400 uppercase font-black">Change Status</label>
                            <select id="adminTaskStatusSelect" class="form-input text-sm py-2 font-semibold" onchange="handleAdminUpdateTaskStatus('${data.id}', this.value)">
                                ${statusOpts}
                            </select>
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-[9px] text-gray-400 uppercase font-black">Actions</label>
                            <button onclick="handleAdminDeleteTask('${data.id}')" class="flex items-center justify-center gap-1.5 p-2 bg-red-50 text-red-600 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors border border-red-100 h-full">
                                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Delete Task
                            </button>
                        </div>
                    </div>

                    <!-- Comment Thread -->
                    <div class="flex-1 bg-gray-50 rounded-2xl border border-gray-100 p-3 mb-3 overflow-y-auto max-h-48" id="taskCommentThread">
                        <p class="text-[9px] text-gray-400 uppercase font-black mb-3 flex items-center gap-1.5">
                            <i data-lucide="message-square" class="w-3 h-3"></i> Reminders &amp; Replies
                            <span class="ml-auto bg-indigo-100 text-indigo-600 rounded-full px-2 py-0.5">${comments.length}</span>
                        </p>
                        ${commentThread}
                    </div>

                    <!-- Send Reminder -->
                    <div class="flex gap-2">
                        <input type="text" id="adminReminderInput" placeholder="Type a reminder to the branch…"
                            class="flex-1 form-input text-sm py-2.5"
                            onkeydown="if(event.key==='Enter' && !event.shiftKey){event.preventDefault();handleSendTaskReminder('${data.id}');}">
                        <button onclick="handleSendTaskReminder('${data.id}')"
                            class="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 active:scale-95">
                            <i data-lucide="send" class="w-4 h-4"></i> Send
                        </button>
                    </div>
                </div>`;

            } else {
                /* ── BRANCH VIEW ────────────────────────────────────────── */
                const adminComments = comments.filter(c => c.sender_role === 'owner');
                const hasReminders = adminComments.length > 0;

                const commentThread = comments.length === 0
                    ? ''
                    : `<div class="space-y-2 mb-4" id="taskCommentThread">
                        <p class="text-[9px] text-indigo-500 uppercase font-black flex items-center gap-1.5">
                            <i data-lucide="bell" class="w-3 h-3"></i> Admin Reminders &amp; Thread
                        </p>
                        ${comments.map(c => {
                        const isBranch = c.sender_role === 'branch';
                        return `
                            <div class="flex ${isBranch ? 'justify-end' : 'justify-start'}">
                                <div class="max-w-[85%] ${isBranch
                                ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm'
                                : 'bg-amber-50 text-gray-800 border border-amber-100 rounded-2xl rounded-tl-sm'
                            } px-4 py-2.5 shadow-sm">
                                    <p class="text-[9px] font-black uppercase tracking-widest mb-1 ${isBranch ? 'text-indigo-200' : 'text-amber-600'}">
                                        ${isBranch ? '🏪 You' : '👤 Admin'}
                                    </p>
                                    <p class="text-sm leading-snug">${c.message}</p>
                                    <p class="text-[9px] mt-1 ${isBranch ? 'text-indigo-300' : 'text-amber-400'}">${fmt.dateTime(c.created_at)}</p>
                                </div>
                            </div>`;
                    }).join('')}
                    </div>`;

                return `
                <div class="p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-gray-900">Task Details</h3>
                        <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                            <i data-lucide="x" class="w-5 h-5"></i>
                        </button>
                    </div>
                    <div class="space-y-3">
                        <div class="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mb-2">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Task</span>
                                ${priorityBadge(data.priority)}
                            </div>
                            <h4 class="text-lg font-bold text-indigo-900">${data.title}</h4>
                        </div>
                        <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-start">
                            <div class="flex flex-col w-full">
                                <p class="text-[10px] text-gray-500 uppercase font-bold mb-1">Instructions</p>
                                <p class="text-sm text-gray-700">${data.description || 'No description provided.'}</p>
                            </div>
                        </div>
                        <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-right">
                            <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3">Status</p>
                            <div class="w-2/3 flex justify-end">${statusBadge(data.status)}</div>
                        </div>
                        <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-right">
                            <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3">Deadline</p>
                            <p class="text-sm font-bold text-red-600 w-2/3">${fmt.date(data.deadline)}</p>
                        </div>

                        ${commentThread}

                        ${hasReminders ? `
                        <!-- Branch reply -->
                        <div class="flex gap-2 mt-2">
                            <input type="text" id="branchReplyInput" placeholder="Reply to admin…"
                                class="flex-1 form-input text-sm py-2.5"
                                onkeydown="if(event.key==='Enter'){event.preventDefault();handleBranchReplyToTask('${data.id}');}">
                            <button onclick="handleBranchReplyToTask('${data.id}')"
                                class="flex items-center gap-1.5 px-3 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors active:scale-95">
                                <i data-lucide="send" class="w-4 h-4"></i>
                            </button>
                        </div>` : ''}
                    </div>

                    <div class="mt-6">
                        ${data.status !== 'completed' ? `
                            <button onclick="handleBranchCompleteTask('${data.id}')"
                                class="w-full flex items-center justify-center gap-2 p-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
                                <i data-lucide="check-circle" class="w-5 h-5"></i> Mark as Completed
                            </button>
                        ` : `
                            <div class="text-center py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm border border-emerald-100">
                                <i data-lucide="check-circle" class="w-5 h-5 inline-block mr-1"></i> Task Completed
                            </div>
                        `}
                    </div>
                </div>`;
            }
        }

        default: return null;
    }
};

/* ── Edit Customer ───────────────────────── */
function _getEditCustomerHTML(data) {
    return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Edit Customer</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleEditCustomer(event, '${data.id}')" class="space-y-4">
                <div>
                    <label for="editCustomerName" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" id="editCustomerName" value="${data.name}" required class="form-input">
                </div>
                <div>
                    <label for="editCustomerPhone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" id="editCustomerPhone" value="${data.phone || ''}" class="form-input">
                </div>
                <div>
                    <label for="editCustomerEmail" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" id="editCustomerEmail" value="${data.email || ''}" class="form-input">
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Update Customer</button>
                </div>
            </form>
        </div>`;
}

/* ── Edit Loan ───────────────────────────── */
function _getEditLoanHTML(data) {
    return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Edit Record</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleEditLoan(event, '${data.id}')" class="space-y-4">
                <div>
                    <label for="editLoanType" class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select id="editLoanType" class="form-input">
                        <option value="income" ${data.type === 'income' ? 'selected' : ''}>Other Income</option>
                        <option value="loan_given" ${data.type === 'loan_given' ? 'selected' : ''}>Loan Given</option>
                        <option value="loan_received" ${data.type === 'loan_received' ? 'selected' : ''}>Loan Received</option>
                        <option value="repayment" ${data.type === 'repayment' ? 'selected' : ''}>Repayment Received</option>
                    </select>
                </div>
                <div>
                    <label for="editLoanParty" class="block text-sm font-medium text-gray-700 mb-1">Party (Name)</label>
                    <input type="text" id="editLoanParty" value="${data.party || ''}" class="form-input">
                </div>
                <div>
                    <label for="editLoanAmount" class="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                    <input type="text" inputmode="decimal" id="editLoanAmount" value="${data.amount}" required class="form-input number-format">
                </div>
                <div>
                    <label for="editLoanNotes" class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea id="editLoanNotes" rows="2" class="form-input">${data.notes || ''}</textarea>
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Update Record</button>
                </div>
            </form>
        </div>`;
}

// ── Shared loading button helper ──────────────────────────────────────────
function _setSubmitLoading(form, loading, originalText) {
    const btn = form.querySelector('[type="submit"]');
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? 'Saving…' : originalText;
}

// ═══════════════════════════════════════════════════════════════════════════
// Form Submit Handlers  (all async — write to Supabase)
// ═══════════════════════════════════════════════════════════════════════════

// ── Branch Preferences Handlers ──────────────────────────────────────────

/**
 * Opens the branch preferences modal with fresh data from the server.
 * Called when admin clicks "Branch Preferences & Allowlist" on a branch card.
 */
window.openBranchPreferencesModal = async function (branchData) {
    try {
        // Re-fetch branch to ensure we have the latest preferences
        const freshBranch = await dbBranches.fetchOne(branchData.id);
        openModal('branchPreferences', freshBranch || branchData);
    } catch (err) {
        // Fallback: open with the data we already have
        openModal('branchPreferences', branchData);
    }
};

/**
 * Handles the live UI toggle inside the branchPreferences modal.
 * Does NOT save to DB — the save happens on "Save Preferences" click.
 */
window.toggleBranchPrefUI = function (btn) {
    const isCurrentlyOn = btn.dataset.on === '1';
    const key = btn.dataset.key;
    const colorOn = btn.dataset.colorOn;
    const badgeColorOn = btn.dataset.colorBadgeOn;
    const thumb = btn.querySelector('span');
    const badge = document.getElementById(`pref-badge-${key}`);

    if (isCurrentlyOn) {
        // Turn OFF
        btn.dataset.on = '0';
        btn.className = btn.className.replace(colorOn, 'bg-gray-200').replace(/ring-\S+/, '');
        if (thumb) { thumb.classList.remove('left-7'); thumb.classList.add('left-1'); }
        if (badge) {
            badge.className = 'text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-400';
            badge.textContent = 'Approval';
        }
    } else {
        // Turn ON
        btn.dataset.on = '1';
        btn.className = btn.className.replace('bg-gray-200', colorOn);
        if (thumb) { thumb.classList.remove('left-1'); thumb.classList.add('left-7'); }
        if (badge) {
            badge.className = `text-[9px] font-black uppercase tracking-widest ${badgeColorOn}`;
            badge.textContent = 'Allowed';
        }
    }
};

/**
 * Reads the current toggle states in the modal and saves them to the DB.
 * Also updates `state.branches` so the owner's view is immediately fresh.
 */
window.handleSaveBranchPreferences = async function (branchId) {
    const toggles = document.querySelectorAll('[id^="pref-toggle-"]');
    const preferences = {};
    toggles.forEach(t => {
        preferences[t.dataset.key] = t.dataset.on === '1';
    });

    const saveBtn = document.querySelector('[onclick*="handleSaveBranchPreferences"]');
    if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving…'; }

    try {
        const updatedBranch = await dbBranches.updatePreferences(branchId, preferences);

        // Update local state so changes take effect immediately without reload
        if (state.branches) {
            const idx = state.branches.findIndex(b => b.id === branchId);
            if (idx > -1) state.branches[idx] = { ...state.branches[idx], preferences };
        }
        // Also update branchProfile if this is the currently-logged-in branch
        if (state.branchProfile && state.branchProfile.id === branchId) {
            state.branchProfile.preferences = preferences;
        }

        showToast('Branch preferences saved!', 'success');
        closeModal();
    } catch (err) {
        showToast('Failed to save preferences: ' + err.message, 'error');
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save Preferences'; }
    }
};

window.handleAssignTask = async function (e) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Assign Task');
    try {
        const branchId = document.getElementById('taskBranch').value;
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDesc').value;
        const priority = document.getElementById('taskPriority').value;
        const deadline = document.getElementById('taskDeadline').value;
        await dbTasks.add(branchId, { title, description, priority, deadline });
        closeModal();
        const branch = state.branches.find(b => b.id === branchId);
        addActivity('task_assigned', `New task assigned: ${title}`, branch?.name || 'Branch');
        showToast('Task assigned successfully!', 'success');
        switchView('tasks');
    } catch (err) {
        showToast('Failed to assign task: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Assign Task');
    }
};

window.handleAddSale = async function (e) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Record Sale');
    try {
        const amount = fmt.parseNumber(document.getElementById('saleAmount').value);
        const customer = document.getElementById('saleCustomer').value || 'Walk-in Customer';
        const payment = document.getElementById('salePayment').value;

        // Build items string from selection
        const productSelect = document.getElementById('saleProduct');
        const qty = document.getElementById('saleQty').value;
        let items = '';
        let productId = null;

        if (productSelect && productSelect.selectedIndex > 0) {
            const option = productSelect.options[productSelect.selectedIndex];
            const name = option.getAttribute('data-name');
            items = `${qty}x ${name}`;
            productId = productSelect.value;
        } else {
            // Fallback if they didn't select (shouldn't happen with required)
            items = 'Custom Item';
        }

        await dbSales.add(state.branchId, { customer, items, amount, payment, productId, qty });
        closeModal();
        const branch = state.branches.find(b => b.id === state.branchId) || { name: 'Branch' };
        addActivity('sale', `New sale to ${customer}`, branch.name, amount);
        showToast(`Sale of ${fmt.currency(amount)} recorded!`, 'success');
        switchView('sales');
    } catch (err) {
        showToast('Failed to record sale: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Record Sale');
    }
};

window.handleAddExpense = async function (e) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Add Expense');
    try {
        const amount = fmt.parseNumber(document.getElementById('expenseAmount').value);
        const category = document.getElementById('expenseCategory').value;
        const description = document.getElementById('expenseDesc').value;
        await dbExpenses.add(state.branchId, { category, description, amount });
        closeModal();
        const branch = state.branches.find(b => b.id === state.branchId) || { name: 'Branch' };
        addActivity('expense', `Expense: ${description}`, branch.name, amount);
        showToast(`Expense of ${fmt.currency(amount)} recorded!`, 'success');
        switchView('expenses');
    } catch (err) {
        showToast('Failed to record expense: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Add Expense');
    }
};

window.handleAddCustomer = async function (e) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Add Customer');
    try {
        const name = document.getElementById('customerName').value;
        const phone = document.getElementById('customerPhone').value;
        const email = document.getElementById('customerEmail').value;
        await dbCustomers.add(state.branchId, { name, phone, email });
        closeModal();
        showToast('Customer added successfully!', 'success');
        switchView('customers');
    } catch (err) {
        showToast('Failed to add customer: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Add Customer');
    }
};

window.handleResetPin = async function (e, branchId) {
    e.preventDefault();
    const newPin = document.getElementById('newPin').value;
    const confirmPin = document.getElementById('confirmPin').value;
    if (newPin !== confirmPin) { showToast('PINs do not match!', 'error'); return; }
    if (!/^\d{6}$/.test(newPin)) { showToast('PIN must be 6 digits', 'error'); return; }
    _setSubmitLoading(e.target, true, 'Reset PIN');
    try {
        await dbBranches.updatePin(branchId, newPin);
        // Update local state too
        const branch = state.branches.find(b => b.id === branchId);
        if (branch) branch.pin = newPin;
        closeModal();
        showToast(`PIN for ${branch?.name || 'branch'} reset successfully!`, 'success');
    } catch (err) {
        showToast('Failed to reset PIN: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Reset PIN');
    }
};

window.handleAddBranch = async function (e) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Create Branch');
    try {
        const name = document.getElementById('branchName').value;
        const location = document.getElementById('branchLocation').value;
        const manager = document.getElementById('branchManager').value || 'Unassigned';
        const pin = document.getElementById('branchPin').value;
        const target = fmt.parseNumber(document.getElementById('branchTarget').value) || 10000;
        const ownerEmail = document.getElementById('branchOwnerEmail').value.trim() || state.currentUser;
        const currency = document.getElementById('branchCurrency').value || 'USD';

        const branch = await dbBranches.add(state.ownerId, {
            name,
            location,
            manager,
            pin,
            target,
            owner_email: ownerEmail,
            currency
        });
        state.branches.push(branch);
        closeModal();
        showToast('Branch added successfully!', 'success');
        switchView('branches');
    } catch (err) {
        showToast('Failed to add branch: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Create Branch');
    }
};

window.handleEditBranch = async function (e, branchId) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Save Changes');
    try {
        const payload = {
            name: document.getElementById('editBranchName').value.trim(),
            location: document.getElementById('editBranchLocation').value.trim(),
            manager: document.getElementById('editBranchManager').value.trim(),
            target: fmt.parseNumber(document.getElementById('editBranchTarget').value) || 10000,
            currency: document.getElementById('editBranchCurrency').value
        };

        const updatedBranch = await dbBranches.updateAdmin(branchId, payload);

        // Update local state without needing to refetch all
        const index = state.branches.findIndex(b => b.id === branchId);
        if (index !== -1) {
            state.branches[index] = { ...state.branches[index], ...updatedBranch };
        }

        closeModal();
        showToast('Branch updated successfully!', 'success');
        switchView('branches'); // re-render the list
    } catch (err) {
        showToast('Failed to edit branch: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Save Changes');
    }
};

window.handleAddNote = async function (e) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Save Note');
    try {
        const title = document.getElementById('noteTitle').value;
        const content = document.getElementById('noteContent').value;
        const tag = document.getElementById('noteTag').value;
        await dbNotes.add(state.branchId, { title, content, tag });
        closeModal();
        showToast('Note saved!', 'success');
        switchView('notes');
    } catch (err) {
        showToast('Failed to save note: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Save Note');
    }
};

window.handleAddLoan = async function (e) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Save Record');
    try {
        const type = document.getElementById('loanType').value;
        const party = document.getElementById('loanParty').value || 'Unknown';
        const amount = fmt.parseNumber(document.getElementById('loanAmount').value);
        const notes = document.getElementById('loanNotes').value;
        await dbLoans.add(state.branchId, { type, party, amount, notes });
        closeModal();
        showToast('Record saved!', 'success');
        switchView('loans');
    } catch (err) {
        showToast('Failed to save record: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Save Record');
    }
};

window.handleAddInventoryItem = async function (e) {
    if (e) e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');

    const itemData = {
        name: document.getElementById('itemName').value,
        sku: document.getElementById('itemSku').value,
        category: document.getElementById('itemCategory').value,
        price: fmt.parseNumber(document.getElementById('itemPrice').value) || 0,
        quantity: fmt.parseNumber(document.getElementById('itemQty').value) || 0,
        min_threshold: fmt.parseNumber(document.getElementById('itemMinThreshold').value) || 10,
        cost_price: fmt.parseNumber(document.getElementById('itemCost').value) || 0,
        supplier: document.getElementById('itemSupplier').value
    };

    // Check if this branch is allowed to add inventory directly
    if (window.branchCanDo && branchCanDo('inventory_add')) {
        // ── DIRECT ADD (no approval required) ──────────────────────────────
        try {
            _setSubmitLoading(btn, true, 'Adding...');
            await dbInventory.add(state.branchId, {
                name: itemData.name,
                sku: itemData.sku,
                category: itemData.category,
                price: itemData.price,
                quantity: itemData.quantity,
                min_threshold: itemData.min_threshold
            });
            showToast(`${itemData.name} added to inventory!`, 'success');
            closeModal();
            if (window.renderInventoryModule) renderInventoryModule();
        } catch (err) {
            showToast('Failed to add item: ' + err.message, 'error');
        } finally {
            _setSubmitLoading(btn, false, 'Add to Inventory');
        }
        return;
    }

    // ── APPROVAL FLOW (default) ─────────────────────────────────────────
    const requestPayload = {
        branch_id: state.branchId,
        owner_id: state.profile.id,
        type: 'inventory_add',
        subject: `New Stock Request: ${itemData.name}`,
        message: `Requesting to add ${itemData.quantity} units of ${itemData.name}. Supplier: ${itemData.supplier}. Total Cost Basis: ${fmt.currency(itemData.quantity * itemData.cost_price)}`,
        metadata: itemData,
        priority: 'medium',
        status: 'pending'
    };

    try {
        _setSubmitLoading(btn, true, 'Submitting...');
        await dbRequests.add(requestPayload);
        showToast('Stock addition request submitted for approval!', 'success');
        closeModal();
        if (window.renderInventoryModule) renderInventoryModule();
    } catch (err) {
        showToast('Failed to submit request: ' + err.message, 'error');
    } finally {
        _setSubmitLoading(btn, false, 'Submit for Approval');
    }
};

window.handleRestockStock = async function (e, id) {
    if (e) e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');

    const restockData = {
        inventory_id: id,
        name: document.getElementById('restockName').value,
        quantity: fmt.parseNumber(document.getElementById('restockQty').value) || 0,
        cost_price: fmt.parseNumber(document.getElementById('restockCost').value) || 0,
        supplier: document.getElementById('restockSupplier').value
    };

    // Check if this branch is allowed to restock directly
    if (window.branchCanDo && branchCanDo('inventory_update')) {
        // ── DIRECT RESTOCK (no approval required) ──────────────────────────
        try {
            _setSubmitLoading(btn, true, 'Restocking...');
            // Fetch current quantity and add to it
            const currentItem = await dbInventory.fetchOne(id);
            if (currentItem) {
                await dbInventory.updateQty(id, currentItem.quantity + restockData.quantity);
                showToast(`${restockData.name} restocked with ${restockData.quantity} units!`, 'success');
                closeModal();
                if (window.renderInventoryModule) renderInventoryModule();
            } else {
                showToast('Could not find inventory item.', 'error');
            }
        } catch (err) {
            showToast('Failed to restock: ' + err.message, 'error');
        } finally {
            _setSubmitLoading(btn, false, 'Restock Now');
        }
        return;
    }

    // ── APPROVAL FLOW (default) ─────────────────────────────────────────
    const requestPayload = {
        branch_id: state.branchId,
        owner_id: state.profile.id,
        type: 'inventory_update', // restock existing
        subject: `Restock Request: ${restockData.name}`,
        message: `Requesting restock of ${restockData.quantity} units for ${restockData.name}. Supplier: ${restockData.supplier}. Cost: ${fmt.currency(restockData.quantity * restockData.cost_price)}`,
        metadata: restockData,
        priority: 'medium',
        status: 'pending'
    };

    try {
        _setSubmitLoading(btn, true, 'Submitting...');
        await dbRequests.add(requestPayload);
        showToast('Restock request submitted!', 'success');
        closeModal();
    } catch (err) {
        showToast('Failed to submit request: ' + err.message, 'error');
    } finally {
        _setSubmitLoading(btn, false, 'Submit Request');
    }
};


window.handleEditSale = async function (e, id) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Update Sale');
    try {
        const amount = fmt.parseNumber(document.getElementById('editSaleAmount').value);
        const customer = document.getElementById('editSaleCustomer').value;
        const items = document.getElementById('editSaleItems').value;
        const payment = document.getElementById('editSalePayment').value;
        await dbSales.update(id, { customer, items, amount, payment });
        closeModal();
        showToast('Sale updated successfully', 'success');
        switchView('sales');
    } catch (err) {
        showToast('Failed to update sale: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Update Sale');
    }
};

window.handleEditInventoryItem = async function (e, id) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Update Item');
    try {
        const name = document.getElementById('editItemName').value;
        const sku = document.getElementById('editItemSku').value;
        const category = document.getElementById('editItemCategory').value;
        const price = fmt.parseNumber(document.getElementById('editItemPrice').value);
        const quantity = parseInt(document.getElementById('editItemQty').value, 10);
        const min_threshold = parseInt(document.getElementById('editItemMinThreshold').value, 10);
        await dbInventory.update(id, { name, sku, category, price, quantity, min_threshold });
        closeModal();
        showToast('Item updated successfully', 'success');
        switchView('inventory');
    } catch (err) {
        showToast('Failed to update item: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Update Item');
    }
};

window.handleEditNote = async function (e, id) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Update Note');
    try {
        const title = document.getElementById('editNoteTitle').value;
        const content = document.getElementById('editNoteContent').value;
        const tag = document.getElementById('editNoteTag').value;
        await dbNotes.update(id, { title, content, tag });
        closeModal();
        showToast('Note updated successfully', 'success');
        switchView('notes');
    } catch (err) {
        showToast('Failed to update note: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Update Note');
    }
};

window.handleEditExpense = async function (e, id) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Update Expense');
    try {
        const amount = fmt.parseNumber(document.getElementById('editExpenseAmount').value);
        const category = document.getElementById('editExpenseCategory').value;
        const description = document.getElementById('editExpenseDesc').value;
        await dbExpenses.update(id, { category, description, amount });
        closeModal();
        showToast('Expense updated successfully', 'success');
        switchView('expenses');
    } catch (err) {
        showToast('Failed to update expense: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Update Expense');
    }
};

window.handleEditCustomer = async function (e, id) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Update Customer');
    try {
        const name = document.getElementById('editCustomerName').value;
        const phone = document.getElementById('editCustomerPhone').value;
        const email = document.getElementById('editCustomerEmail').value;
        await dbCustomers.update(id, { name, phone, email });
        closeModal();
        showToast('Customer updated successfully', 'success');
        switchView('customers');
    } catch (err) {
        showToast('Failed to update customer: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Update Customer');
    }
};

window.handleEditLoan = async function (e, id) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Update Record');
    try {
        const type = document.getElementById('editLoanType').value;
        const party = document.getElementById('editLoanParty').value;
        const amount = fmt.parseNumber(document.getElementById('editLoanAmount').value);
        const notes = document.getElementById('editLoanNotes').value;
        await dbLoans.update(id, { type, party, amount, notes });
        closeModal();
        showToast('Record updated successfully', 'success');
        switchView('loans');
    } catch (err) {
        showToast('Failed to update record: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Update Record');
    }
};

/* ── Request Attention Handlers ─────────────────── */
window.openRequestModal = function (type, id, summary) {
    openModal('requestAttention', { type, id, summary });
};

window.handleRequestAttention = async function (e) {
    if (e) e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');

    const rawRelatedId = document.getElementById('reqRelatedId').value;
    const payload = {
        branch_id: state.branchId,
        owner_id: state.profile.id, // Profile ID is the owner's UUID
        type: document.getElementById('reqType').value,
        related_id: (rawRelatedId && rawRelatedId !== 'null' && rawRelatedId !== '') ? rawRelatedId : null,
        related_summary: document.getElementById('reqSummary').value,
        subject: document.getElementById('reqSubject').value,
        message: document.getElementById('reqMessage').value,
        priority: document.getElementById('reqPriority').value,
        status: 'pending'
    };

    try {
        _setSubmitLoading(btn, true, 'Sending...');
        await dbRequests.add(payload);
        showToast('Approval request sent successfully!');
        closeModal();
    } catch (err) {
        showToast('Failed to send request: ' + err.message, 'error');
    } finally {
        _setSubmitLoading(btn, false, 'Request Approval');
    }
};

window.handleEditGeneralRequest = async function (e, id) {
    if (e) e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const updateData = {
        subject: document.getElementById('editReqSubject').value,
        message: document.getElementById('editReqMessage').value,
        priority: document.getElementById('editReqPriority').value
    };
    try {
        _setSubmitLoading(btn, true, 'Updating...');
        await dbRequests.update(id, updateData);
        showToast('Request updated successfully!', 'success');
        closeModal();
        if (window.renderBranchRequestsList) renderBranchRequestsList();
    } catch (err) {
        showToast('Failed to update request: ' + err.message, 'error');
    } finally {
        _setSubmitLoading(btn, false, 'Update Request');
    }
};

window.handleEditInventoryAddRequest = async function (e, id) {
    if (e) e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');

    const itemData = {
        name: document.getElementById('editItemNameAdd').value,
        sku: document.getElementById('editItemSkuAdd').value,
        category: document.getElementById('editItemCategoryAdd').value,
        price: fmt.parseNumber(document.getElementById('editItemPriceAdd').value) || 0,
        quantity: fmt.parseNumber(document.getElementById('editItemQtyAdd').value) || 0,
        min_threshold: fmt.parseNumber(document.getElementById('editItemMinThresholdAdd').value) || 10,
        cost_price: fmt.parseNumber(document.getElementById('editItemCostAdd').value) || 0,
        supplier: document.getElementById('editItemSupplierAdd').value
    };

    const updateData = {
        subject: `New Stock Request: ${itemData.name} (Updated)`,
        message: `Requesting to add ${itemData.quantity} units of ${itemData.name}. Supplier: ${itemData.supplier}. Total Cost Basis: ${fmt.currency(itemData.quantity * itemData.cost_price)}`,
        metadata: itemData
    };

    try {
        _setSubmitLoading(btn, true, 'Updating...');
        await dbRequests.update(id, updateData);
        showToast('Stock request updated!', 'success');
        closeModal();
        if (window.renderBranchRequestsList) renderBranchRequestsList();
    } catch (err) {
        showToast('Failed to update request: ' + err.message, 'error');
    } finally {
        _setSubmitLoading(btn, false, 'Update Request');
    }
};

window.handleEditRestockRequest = async function (e, id) {
    if (e) e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');

    const restockData = {
        inventory_id: document.getElementById('editRestockInvId').value,
        name: document.getElementById('editRestockName').value,
        quantity: fmt.parseNumber(document.getElementById('editRestockQty').value) || 0,
        cost_price: fmt.parseNumber(document.getElementById('editRestockCost').value) || 0,
        supplier: document.getElementById('editRestockSupplier').value
    };

    const updateData = {
        subject: `Restock Request: ${restockData.name} (Updated)`,
        message: `Requesting restock of ${restockData.quantity} units for ${restockData.name}. Supplier: ${restockData.supplier}. Cost: ${fmt.currency(restockData.quantity * restockData.cost_price)}`,
        metadata: restockData
    };

    try {
        _setSubmitLoading(btn, true, 'Updating...');
        await dbRequests.update(id, updateData);
        showToast('Restock request updated!', 'success');
        closeModal();
        if (window.renderBranchRequestsList) renderBranchRequestsList();
    } catch (err) {
        showToast('Failed to update request: ' + err.message, 'error');
    } finally {
        _setSubmitLoading(btn, false, 'Update Request');
    }
};

// ── Admin Task Actions ───────────────────────────────────────────────────────
window.handleAdminUpdateTaskStatus = async function (taskId, newStatus) {
    try {
        await dbTasks.updateStatus(taskId, newStatus);
        showToast('Task status updated', 'success');
        if (window.renderTasksManagement) window.renderTasksManagement();
    } catch (err) {
        showToast('Failed to update status', 'error');
    }
};

window.handleAdminDeleteTask = async function (taskId) {
    const confirmed = await window.confirmModal('Delete Task', 'Are you sure you want to delete this task?', 'Yes, Delete', 'Cancel', 'bg-red-600 hover:bg-red-700');
    if (!confirmed) return;
    try {
        await dbTasks.bulkDelete([taskId]);
        showToast('Task deleted', 'success');
        closeModal();
        if (window.renderTasksManagement) window.renderTasksManagement();
    } catch (err) {
        showToast('Failed to delete task', 'error');
    }
};

// ── Task Reminders & Replies ─────────────────────────────────────────────────
window.handleSendTaskReminder = async function (taskId) {
    const input = document.getElementById('adminReminderInput');
    if (!input || !input.value.trim()) return;
    const msg = input.value.trim();

    try {
        input.disabled = true;
        await dbTaskComments.add(taskId, 'owner', state.profile?.name || 'Admin', msg);
        showToast('Reminder sent', 'success');

        // Refresh the modal to show the new comment
        const freshTask = await dbTasks.fetchOne(taskId);
        if (freshTask) {
            freshTask._comments = await dbTaskComments.fetchAll(taskId);
            openModal('taskDetails', freshTask);
        }
    } catch (err) {
        showToast('Failed to send reminder', 'error');
        input.disabled = false;
    }
};

window.handleBranchReplyToTask = async function (taskId) {
    const input = document.getElementById('branchReplyInput');
    if (!input || !input.value.trim()) return;
    const msg = input.value.trim();

    try {
        input.disabled = true;
        await dbTaskComments.add(taskId, 'branch', state.branchProfile?.name || 'Branch', msg);
        showToast('Reply sent', 'success');

        // Refresh the modal 
        const freshTask = await dbTasks.fetchOne(taskId);
        if (freshTask) {
            freshTask._comments = await dbTaskComments.fetchAll(taskId);
            openModal('taskDetails', freshTask);
        }
    } catch (err) {
        showToast('Failed to send reply', 'error');
        input.disabled = false;
    }
};

// ── Branch Task Completion ─────────────────────────────────────────────────
window.handleBranchCompleteTask = async function (taskId) {
    const confirmed = await window.confirmModal('Complete Task', 'Are you sure you want to mark this task as completed?', 'Yes, Complete', 'Cancel', 'bg-emerald-600 hover:bg-emerald-700');
    if (!confirmed) return;
    try {
        await dbTasks.updateStatus(taskId, 'completed');

        const branchName = state.branchProfile?.name || 'Branch';
        if (typeof addActivity === 'function') {
            addActivity('task_completed', `Task completed`, branchName);
        }

        showToast('Task completed! 🎉', 'success');
        closeModal();
        if (window.renderBranchTasks) renderBranchTasks();
    } catch (err) {
        showToast('Failed to complete task: ' + err.message, 'error');
    }
};

/* ── Close modal on backdrop click ──────────────── */
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('modalOverlay')
        ?.addEventListener('click', e => { if (e.target.id === 'modalOverlay') closeModal(); });
});
