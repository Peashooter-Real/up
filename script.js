document.addEventListener('DOMContentLoaded', () => {
    initPowerObserver();







    let alertContainer = document.getElementById('vanguard-alert-container');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'vanguard-alert-container';
        alertContainer.style.position = 'fixed';
        alertContainer.style.top = '10%';
        alertContainer.style.left = '50%';
        alertContainer.style.transform = 'translateX(-50%)';
        alertContainer.style.display = 'flex';
        alertContainer.style.flexDirection = 'column';
        alertContainer.style.gap = '8px';
        alertContainer.style.zIndex = '999999';
        alertContainer.style.pointerEvents = 'none';
        alertContainer.style.alignItems = 'center';
        document.body.appendChild(alertContainer);
    }

    window.alert = function (msg) {
        // Anti-spam filter
        const now = Date.now();
        if (!window._alertHistory) window._alertHistory = {};
        if (window._alertHistory[msg] && (now - window._alertHistory[msg] < 3000)) {
            return; // Ignore identical message within 3 seconds
        }
        window._alertHistory[msg] = now;

        const box = document.createElement('div');
        box.className = 'vanguard-alert-box fade-in';
        box.style.position = 'static';
        box.style.transform = 'none';
        box.style.width = 'fit-content';
        box.style.minWidth = '280px';
        box.style.maxWidth = '90vw';
        box.style.padding = '12px 20px';
        box.style.margin = '5px 0';
        box.style.background = 'rgba(10, 10, 20, 0.95)';
        box.style.border = '1px solid var(--accent-vanguard)';
        box.style.borderRadius = '15px';
        box.style.backdropFilter = 'blur(12px)';
        box.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 42, 109, 0.2)';
        box.style.zIndex = '1000000';
        
        // Highlight Power / Trigger events in Cyan
        const isPower = msg.includes('+') || msg.toLowerCase().includes('power') || msg.toLowerCase().includes('trigger');
        if (isPower) {
            box.style.borderColor = "#05d9e8";
            box.style.boxShadow = '0 0 25px rgba(5, 217, 232, 0.4)';
        }

        box.innerHTML = `
        <div class="vanguard-alert-content" style="text-align: center; display: flex; align-items: center; gap: 10px; justify-content: center;">
            <span style="font-size: 1.2rem;">${isPower ? '⚡' : '🔔'}</span>
            <p style="color: white; font-size: 1rem; margin: 0; font-family: 'Outfit', sans-serif; font-weight: 600; text-shadow: 0 0 5px rgba(0,0,0,0.8); letter-spacing: 0.5px;">${msg}</p>
        </div>
    `;
        alertContainer.appendChild(box);
        
        // Auto-remove after longer duration (5s) to ensure readability during combo
        setTimeout(() => {
            box.classList.remove('fade-in');
            box.classList.add('fade-out');
            setTimeout(() => box.remove(), 500);
        }, 5000); 
    };

    window.vgConfirm = function (msg) {
        if (isAIMode && !isMyTurn) return Promise.resolve(true);
        return new Promise(resolve => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.style.zIndex = '999999';
            overlay.innerHTML = `
            <div class="modal-content glass-panel" style="width: 90%; max-width: 400px; text-align: center; padding: 2rem; background: rgba(15, 15, 25, 0.95); border: 2px solid var(--accent-vanguard); border-radius: 20px; box-shadow: 0 0 30px rgba(255, 42, 109, 0.5); font-family: 'Orbitron', sans-serif;">
                <h3 style="color: var(--accent-vanguard); margin-top: 0; margin-bottom: 15px; font-size: 1.3rem; text-shadow:0 0 10px #f00;">ACTION REQUIRED</h3>
                <p style="color: white; font-size: 1.1rem; margin-bottom: 25px; font-family: sans-serif; line-height: 1.4;">${msg}</p>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button id="vg-confirm-yes" class="glass-btn highlight-btn" style="flex: 1; padding: 0.9rem; background: var(--accent-vanguard); border: none; font-size: 1rem; color: #fff; cursor:pointer; font-weight: bold;">CONFIRM</button>
                    <button id="vg-confirm-no" class="glass-btn" style="flex: 1; padding: 0.9rem; background: rgba(255, 255, 255, 0.05); color: #aaa; border: 1px solid #444; font-size: 1rem; cursor:pointer;">CANCEL</button>
                </div>
            </div>
        `;
            document.body.appendChild(overlay);

            overlay.querySelector('#vg-confirm-yes').onclick = () => {
                overlay.remove();
                resolve(true);
            };
            overlay.querySelector('#vg-confirm-no').onclick = () => {
                overlay.remove();
                resolve(false);
            };
        });
    };
    /* --- Prison Zone Management System --- */
    
    // Initialize prison zones visibility based on decks in play
    function initPrisonZones() {
        const myPrisonZone = document.getElementById('my-prison-zone');
        const oppPrisonZone = document.getElementById('opp-prison-zone');
        const quickPrisonBtn = document.getElementById('quick-prison-btn');
        const oppQuickPrisonBtn = document.getElementById('opp-quick-prison-btn');
        
        // Check if either deck involves prison mechanics
        const hasPrisonDeck = (deck) => {
            if (!deck) return false;
            const allCards = [...(deck.rideDeck || []), ...(deck.mainDeck || [])];
            return allCards.some(c => (c.name || '').toLowerCase().includes('prison') || 
                                     (c.name || '').toLowerCase().includes('seraph') ||
                                     (c.name || '').toLowerCase().includes('aurora'));
        };
        
        const myDeckIsPrison = hasPrisonDeck(currentDeck);
        // For AI mode, check aiDeckType; for multiplayer, we detect from opponent's order zone
        let oppDeckIsPrison = false;
        if (isAIMode) {
            let aiFullDeckRef;
            if (aiDeckType === 'seraph') oppDeckIsPrison = true;
        }
        
        // Reveal ONLY the specific side's prison UI if their deck dictates it
        if (myDeckIsPrison) {
            if (myPrisonZone) myPrisonZone.classList.remove('hidden');
            if (quickPrisonBtn) quickPrisonBtn.classList.remove('hidden');
        }
        if (oppDeckIsPrison) {
            if (oppPrisonZone) oppPrisonZone.classList.remove('hidden');
            if (oppQuickPrisonBtn) oppQuickPrisonBtn.classList.remove('hidden');
        }
        
        // Add click handlers to prison zones for viewing contents
        if (myPrisonZone) {
            myPrisonZone.addEventListener('click', () => viewPrisonZone('my'));
        }
        if (oppPrisonZone) {
            oppPrisonZone.addEventListener('click', () => viewPrisonZone('opp'));
        }
        
        // Initial update
        updatePrisonUI('my');
        updatePrisonUI('opponent');
    }
    
    // Show prison zones dynamically (called when prison card detected)
    function showPrisonZonesIfNeeded() {
        const myOrderZone = document.querySelector('.my-side .order-zone');
        const oppOrderZone = document.querySelector('.opponent-side .order-zone');
        
        const hasPrisonInZone = (zone) => {
            if (!zone) return false;
            return Array.from(zone.querySelectorAll('.card')).some(c => 
                (c.dataset.name || '').toLowerCase().includes('prison')
            );
        };
        
        const myPZ = document.getElementById('my-prison-zone');
        const oppPZ = document.getElementById('opp-prison-zone');
        const qPB = document.getElementById('quick-prison-btn');
        const oqPB = document.getElementById('opp-quick-prison-btn');

        if (hasPrisonInZone(myOrderZone)) {
            if (myPZ) myPZ.classList.remove('hidden');
            if (qPB) qPB.classList.remove('hidden');
        }
        if (hasPrisonInZone(oppOrderZone)) {
            if (oppPZ) oppPZ.classList.remove('hidden');
            if (oqPB) oqPB.classList.remove('hidden');
        }
    }

    function updatePrisonUI(side) {
        const sideClass = side === 'my' ? '.my-side' : '.opponent-side';
        const sideId = side === 'my' ? 'my' : 'opp';
        const orderZone = document.querySelector(`${sideClass} .order-zone`);
        if (!orderZone) return;

        // Check for Prison Order card in the zone
        const hasPrison = Array.from(orderZone.querySelectorAll('.card')).some(c => 
            (c.dataset.name || "").toLowerCase().includes('prison')
        );

        // Count imprisoned cards (non-prison cards in the order zone)
        const imprisonedCards = Array.from(orderZone.querySelectorAll('.card')).filter(c => 
            !(c.dataset.name || "").toLowerCase().includes('prison')
        );
        const actualImprisoned = imprisonedCards.length;

        // Update the dedicated prison zone container
        const prisonContainer = document.getElementById(`${sideId}-prison-zone`);
        const prisonCountEl = document.getElementById(`${sideId}-prison-count`);
        const prisonCardStack = document.getElementById(`${sideId}-prison-cards`);
        const quickPrisonNum = document.getElementById(`${sideId === 'my' ? '' : 'opp-'}quick-prison-num`);
        const quickPrisonBtn = document.getElementById(`${sideId === 'my' ? '' : 'opp-'}quick-prison-btn`);

        if (prisonContainer) {
            // Show the prison zone if there's a prison card OR inmates
            if (hasPrison || actualImprisoned > 0) {
                prisonContainer.classList.remove('hidden');
                // Force global check to show related UI bits
                showPrisonZonesIfNeeded();
            }
            
            // Toggle has-inmates class
            if (actualImprisoned > 0) {
                prisonContainer.classList.add('has-inmates');
            } else {
                prisonContainer.classList.remove('has-inmates');
            }
        }

        // Update count number with bump animation
        if (prisonCountEl) {
            const oldCount = parseInt(prisonCountEl.textContent || '0');
            prisonCountEl.textContent = actualImprisoned;
            if (oldCount !== actualImprisoned) {
                prisonCountEl.classList.remove('bumped');
                void prisonCountEl.offsetWidth; // Force reflow
                prisonCountEl.classList.add('bumped');
            }
        }

        // Update mini-card thumbnails
        if (prisonCardStack) {
            const existingMinis = prisonCardStack.querySelectorAll('.prison-mini-card');
            const existingCount = existingMinis.length;
            
            // Clear and rebuild mini cards
            prisonCardStack.innerHTML = '';
            imprisonedCards.forEach((card, i) => {
                const mini = document.createElement('div');
                mini.className = 'prison-mini-card';
                // Use card image if available
                const imgUrl = card.dataset.imageUrl || cardImages[card.dataset.name] || '';
                if (imgUrl) {
                    mini.style.backgroundImage = `url('${imgUrl}')`;
                }
                mini.title = card.dataset.name || 'Unknown';
                // Animate newly added cards
                if (i >= existingCount) {
                    mini.classList.add('just-added');
                    setTimeout(() => mini.classList.remove('just-added'), 600);
                }
                prisonCardStack.appendChild(mini);
            });
        }

        // Update quick access button
        if (quickPrisonNum) {
            quickPrisonNum.textContent = actualImprisoned;
        }
        if (quickPrisonBtn) {
            if (hasPrison) quickPrisonBtn.classList.remove('hidden');
            if (actualImprisoned > 0) {
                quickPrisonBtn.classList.add('has-inmates');
            } else {
                quickPrisonBtn.classList.remove('has-inmates');
            }
        }

        // Also maintain the old order-zone visual (prison-active class) for backward compatibility
        if (hasPrison) {
            orderZone.classList.add('prison-active');
        } else {
            orderZone.classList.remove('prison-active');
        }

        // Broadcast prison count to opponent for real-time sync
        if (side === 'my' && (conn || isAIMode)) {
            sendData({ type: 'prisonSync', count: actualImprisoned, side: 'opponent' });
        }
    }

    // View imprisoned cards in the zone viewer
    window.viewPrisonZone = (side) => {
        const sideClass = side === 'my' ? '.my-side' : '.opponent-side';
        const orderZone = document.querySelector(`${sideClass} .order-zone`);
        if (!orderZone) return;
        
        const imprisonedCards = Array.from(orderZone.querySelectorAll('.card')).filter(c => 
            !(c.dataset.name || "").toLowerCase().includes('prison')
        );
        
        if (imprisonedCards.length === 0) {
            alert(`🔒 ${side === 'my' ? 'My' : "Opponent's"} Prison: ไม่มีนักโทษในคุก`);
            return;
        }
        openViewer(`🔒 ${side === 'my' ? 'My' : "Opponent's"} Prison (${imprisonedCards.length} inmates)`, imprisonedCards);
        
        // Show bailout actions if viewing opponent's prison (where our cards are)
        if (side === 'opp') {
            const prisonActions = document.getElementById('prison-bailout-actions');
            if (prisonActions) prisonActions.classList.remove('hidden');
        }
    };

    // Comprehensive update for both sides (called after any prison-related change)  
    function updateAllPrisonUI() {
        updatePrisonUI('my');
        updatePrisonUI('opponent');
    }


    // --- UI Elements ---
    const playerHand = document.getElementById('player-hand');
    const handCountNum = document.getElementById('hand-count-num');
    const boardAreas = document.querySelectorAll('.circle, .zone, .guardian-circle');
    const phaseSteps = document.querySelectorAll('.phase-step');
    const turnIndicator = document.getElementById('turn-indicator');
    const nextPhaseBtn = document.getElementById('next-phase-btn');
    const nextTurnBtn = document.getElementById('next-turn-btn');
    const soulCounter = document.getElementById('soul-counter');
    const handleSoulView = (e) => {
        if (e) e.stopPropagation();
        if (soulPool.length === 0) {
            alert("Soul is empty.");
            return;
        }
        openViewer("Soul Content", soulPool);
    };
    if (soulCounter) soulCounter.addEventListener('click', handleSoulView);
    const dropCountNum = document.getElementById('drop-count-num');
    const viewDropBtn = document.getElementById('view-drop-btn');
    const viewDamageBtn = document.getElementById('view-damage-btn');
    const damageCountNum = document.getElementById('damage-count-num');
    const deckCountNum = document.getElementById('deck-count-num');
    const zoneViewer = document.getElementById('zone-viewer');
    const viewerTitle = document.getElementById('viewer-title');
    const viewerGrid = document.getElementById('viewer-grid');
    const closeViewerBtn = document.getElementById('close-viewer-btn');

    // Skill Viewer
    const skillViewer = document.getElementById('skill-viewer');
    const skillCardName = document.getElementById('skill-card-name');
    const skillCardGrade = document.getElementById('skill-card-grade');
    const skillCardPower = document.getElementById('skill-card-power');
    const skillCardShield = document.getElementById('skill-card-shield');
    const skillText = document.getElementById('skill-text');
    const closeSkillBtn = document.getElementById('close-skill-btn');

    // Opponent info
    const oppHandCountNum = document.getElementById('opp-hand-count');
    const oppDeckCountNum = document.getElementById('opp-deck-count-num');
    const oppDropCountNum = document.getElementById('opp-drop-count-num');
    const oppDamageCountNum = document.getElementById('opp-damage-count-num');
    const oppSoulBadge = document.getElementById('opp-soul-counter');
    window.oppSoulPool = [];
    if (oppSoulBadge) {
        oppSoulBadge.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!window.oppSoulPool || window.oppSoulPool.length === 0) {
                alert("Opponent's Soul is empty.");
                return;
            }
            openViewer("Opponent's Soul", window.oppSoulPool.map(c => createCardElement(c)));
        });
    }
    const oppViewDropBtn = document.getElementById('opp-view-drop-btn');
    const oppViewDamageBtn = document.getElementById('opp-view-damage-btn');

    // Matchmaking / Overlay Elements
    const matchmakingOverlay = document.getElementById('matchmaking-overlay');
    const matchmakingSubtitle = document.getElementById('matchmaking-subtitle');
    const idDisplayBox = document.getElementById('id-display-box');
    const gamePeerIdDisplay = document.getElementById('game-peer-id');
    const copyGameIdBtn = document.getElementById('copy-game-id-btn');
    const gameStatusText = document.getElementById('game-status-text');
    const networkInfo = document.getElementById('network-info');
    const gameContainer = document.getElementById('game-container');
    const startAIModeBtn = document.getElementById('start-ai-mode-btn');
    const aiSetupOverlay = document.getElementById('ai-setup-overlay');
    const confirmAIStartBtn = document.getElementById('confirm-ai-start-btn');
    const playerDeckSelect = document.getElementById('player-deck-select');
    const aiDeckSelect = document.getElementById('ai-deck-select');
    const aiDifficultySelect = document.getElementById('ai-difficulty');

    const bailoutSbBtn = document.getElementById('bailout-sb-btn');
    const bailoutCbBtn = document.getElementById('bailout-cb-btn');

    if (bailoutSbBtn) {
        bailoutSbBtn.onclick = async () => {
            if (!isMyTurn || phases[currentPhaseIndex] !== 'main') {
                alert("คุณสามารถประกันตัวได้ในเทิร์นของคุณและช่วง Main Phase เท่านั้น!");
                return;
            }
            if (await paySoulBlast(1)) {
                alert("จ่าย [SB1] สำเร็จ! กรุณาเลือกการ์ด 1 ใบจากในหน้าต่างนี้เพื่อประกันตัวกลับลง (RC)");
                window.bailoutPendingCount = 1; 
                document.body.classList.add('targeting-mode');
            }
        };
    }
    
    if (bailoutCbBtn) {
        bailoutCbBtn.onclick = async () => {
            if (!isMyTurn || phases[currentPhaseIndex] !== 'main') {
                alert("คุณสามารถประกันตัวได้ในเทิร์นของคุณและช่วง Main Phase เท่านั้น!");
                return;
            }
            if (payCounterBlast(1)) {
                window.freeBailout = (window.freeBailout || 0) + 1;
                alert("จ่าย [CB1] สำเร็จ! คุณสามารถประกันตัวการ์ดได้สูงสุด 2 ใบ (เลือกใบแรกจากในหน้าต่างนี้)");
                window.bailoutPendingCount = 2;
                document.body.classList.add('targeting-mode');
            }
        };
    }

    if (startAIModeBtn) {
        startAIModeBtn.onclick = () => {
            aiSetupOverlay.classList.remove('hidden');
        };
    }

    if (confirmAIStartBtn) {
        confirmAIStartBtn.onclick = () => {
            aiSetupOverlay.classList.add('hidden');
            const pDeck = playerDeckSelect.value;
            const aDeck = aiDeckSelect.value;
            const diff = aiDifficultySelect.value;
            startAIGame(pDeck, aDeck, diff);
        };
    }

    // --- State Variables ---
    let cardIdCounter = 0;
    let draggedCard = null;
    let attackingCard = null;
    let deckPool = [];
    let currentTurn = 1;
    let isFirstPlayer = true; // Host defaults to true, Guest will set to false
    window.isFirstPlayer = true; // Global mirror for easier debugging
    const phases = ['stand', 'draw', 'ride', 'main', 'battle', 'end'];
    let currentPhaseIndex = 0;
    let hasRiddenThisTurn = false;
    let hasDiscardedThisTurn = false;
    let hasDrawnThisTurn = false;
    let soulPool = [];
    let bindPool = [];
    window.oppBindPool = [];

    // --- Multiplayer State ---
    let peer = null;
    let conn = null;
    let isHost = false;
    let isMyTurn = false;
    let gameStarted = false; // Add flag to track if game has actually begun
    let isGuarding = false; // Add guard checking state
    let isWaitingForGuard = false;
    let pendingPowerIncrease = 0;
    let pendingCriticalIncrease = 0;
    let targetingType = null; // 'power' or 'critical' or 'both'

    function imprisonCard(card) {
        if (!card) return;
        
        let targetZone;
        const myOrderZone = document.querySelector('.my-side .order-zone');
        const oppOrderZone = document.querySelector('.opponent-side .order-zone');

        // Check which side has the Prison card set
        const myHasPrison = myOrderZone && Array.from(myOrderZone.querySelectorAll('.card')).some(c => 
            (c.dataset.name || "").toLowerCase().includes('prison')
        );
        const oppHasPrison = oppOrderZone && Array.from(oppOrderZone.querySelectorAll('.card')).some(c => 
            (c.dataset.name || "").toLowerCase().includes('prison')
        );

        if (myHasPrison && !oppHasPrison) {
            // Only we have a prison (We are Seraph) -> All inmates come here
            targetZone = myOrderZone;
        } else if (!myHasPrison && oppHasPrison) {
            // Only opponent has a prison (They are Seraph) -> All inmates go there
            targetZone = oppOrderZone;
        } else {
            // Mirror match or no prison set yet -> move to opposite side of owner
            if (card.classList.contains('opponent-card')) {
                targetZone = myOrderZone;
            } else {
                targetZone = oppOrderZone;
            }
        }

        if (targetZone) {
            const wasInHand = card.closest('#player-hand');
            
            targetZone.appendChild(card);
            card.classList.add('imprisoned-card');
            card.classList.remove('rest');
            
            // Standard sync call
            sendMoveData(card, 'order-zone');
            sendData({ type: 'checkUpdateSeraph' });
            
            if (wasInHand) updateHandSpacing();
            updateAllStaticBonuses();
            updateAllPrisonUI();
        }
    }
    let pendingDamageChecks = 0; // Queue damage until drive checks finish
    let currentAttackData = null; // Store for recalculation after buffs
    let currentAttackResolving = false;
    let isProcessingDamage = false; // New flag to wait for damage checks to complete
    let selectedCard = null; // Track selected card for tap-to-move
    let personaRideActive = false;
    let isOpponentPersonaRide = false;
    let isFinalRush = false;
    let isFinalBurst = false;
    let finalRushTurnLimit = 0;
    let isOpponentFinalRush = false;
    let isOpponentFinalBurst = false;
    let turnAttackCount = 0;
    let orderPlayedThisTurn = false;
    let ordersPlayedCount = 0;
    let maxOrdersPerTurn = 1;
    let nextSetOrderFree = false;
    window.regalisPieceUsed = false;
    let lastStrategyPutIntoSoulName = "";
    let strategyPutToOrderZoneThisTurn = false;
    let bomberDustingPowerBuff = false;
    let bomberDustingNoIntercept = false;
    let bomberDustingNoBlitz = false;
    let myRpsChoice = null;
    let oppRpsChoice = null;
    let hasConfirmedMulligan = false;
    let oppConfirmedMulligan = false;
    let rpsResolved = false;
    window.myRGRetiredThisTurn = false;
    let strategyActivatedThisTurn = false;
    let shockStrategyActive = false;
    let strategyActivatedCount = 0;

    // --- AI Mode State ---
    let isAIMode = false;
    let aiDifficulty = 'hard';
    let aiDeckType = 'bruce';
    let aiHand = [];
    let aiDeck = [];
    let aiRideDeck = [];
    let aiSoul = [];
    let aiDamage = [];
    let aiDrop = [];
    let aiOrderZone = [];
    let aiThinking = false;

    // --- Card Image Database ---
    const cardImages = {
        // Bruce Deck
        'Diabolos, "Innocent" Matt': 'picture/grade0_bruce.jpg',
        'Diabolos, "Bad" Steve': 'picture/grade1_bruce.jpg',
        'Diabolos, "Anger" Richard': 'picture/grade2_bruce.jpg',
        'Diabolos, "Viamance" Bruce': 'picture/grade3_bruce.jpg',
        'Diabolos Diver, Julian': 'picture/julian.jpg',
        'Diabolos Madonna, Megan': 'picture/megan.jpg',
        'Diabolos Boys, Eden': 'picture/eden.jpg',
        'Diabolos Buckler, Jamil': 'picture/jamil.jpg',
        'Recusal Hate Dragon (Perfect Guard)': 'picture/recusal.jpg',
        'Diabolos Girls, Stefanie': 'picture/stefani.jpg',
        'Diabolos Madonna, Mabel': 'picture/mabel.jpg',
        'Diabolos Girls, Ivanka': 'picture/ivanka.jpg',

        // Triggers - Dark States (Bruce)
        'Critical Trigger (Dark States)': 'picture/bruce_crit.png',
        'Draw Trigger (Dark States)': 'picture/bruce_draw.png',
        'Front Trigger (Dark States)': 'picture/bruce_front.png',
        'Heal Trigger (Dark States)': 'picture/bruce_heal.png',
        'Hades Dragon Deity, Gallmageveld': 'picture/bruce_over.png',

        // Magnolia Deck
        'Sylvan Horned Beast, Lotte': 'picture/grade0_magnolia.jpg',
        'Sylvan Horned Beast, Charis': 'picture/grade1_magnolia.jpg',
        'Sylvan Horned Beast, Lattice': 'picture/grade2_magnolia.jpg',
        'Sylvan Horned Beast King, Magnolia': 'picture/grade3_magnolia.jpg',
        'Sylvan Horned Beast Emperor, Magnolia Elder': 'picture/grade4_magnolia.jpg',
        'Blue Artillery Dragon, Inlet Pulse Dragon': 'picture/fly.jpg',
        'Sylvan Horned Beast, Giunosla': 'picture/giunosla.jpg',
        'Sylvan Horned Beast, Enpix': 'picture/enpix.jpg',
        'Sylvan Horned Beast, Goildoat': 'picture/golidoat.jpg',
        'Sylvan Horned Beast, Alpin': 'picture/alpin.jpg',
        'Sylvan Horned Beast, Winnsapooh': 'picture/winnsapooh.jpg',
        'Sylvan Horned Beast, Gabregg': 'picture/gabregg.jpg',
        'Sylvan Horned Beast, Bojalcorn': 'picture/bojalcorn.jpg',
        'Spiritual Body Condensation': 'picture/spirit.jpg',
        'In the Dim Darkness, the Frozen Resentment': 'picture/dark.jpg',

        // Triggers - Stoicheia (Magnolia)
        'Critical Trigger (Stoicheia)': 'picture/stoicheia_crit.png',
        'Draw Trigger (Stoicheia)': 'picture/stoicheia_draw.png',
        'Front Trigger (Stoicheia)': 'picture/stoicheia_front.png',
        'Heal Trigger (Stoicheia)': 'picture/stoicheia_heal.png',
        'Source Dragon Deity, Blessfavor': 'greedon/mucca.png', // Placeholder จากรูปเก่า
        'Custodial Dragon (Perfect Guard)': 'picture/custodial_dragon.png',

        // Nirvana Jheva Deck
        'Sunrise Egg': 'picnirvana/0nir.jpg',
        'Heart-pounding Blaze Maiden, Rino': 'picnirvana/1nir.jpg',
        'Snuggling Blaze Maiden, Reiyu': 'picnirvana/reiyu.png',
        'Chakrabarthi Pheonix Dragon, Nirvana Jheva': 'picnirvana/nirvana_jheva.png',
        'Trickstar': 'picnirvana/star.jpg',
        'Sparkle Rejector Dragon (Perfect Guard)': 'picnirvana/sparkle_rejector.png',
        'Illuminate Equip Dragon, Graillumirror': 'picnirvana/graillumirror.png',
        'Strike Equip Dragon, Stragallio': 'picnirvana/stragallio.png',
        'Sword Equip Dragon, Galondight': 'picnirvana/galondight.png',
        'Mirror Reflection Equip, Mirrors Vairina': 'picnirvana/mirrors.png',
        'Jeweled Sword Equip, Garou Vairina': 'picnirvana/garou.png',
        'Sturdy Wall Equip, Vils Vairina': 'picnirvana/vils.png',
        'Brilliant Equip, Bram Vairina': 'picnirvana/bram.png',
        'Flaring Cannon Equip, Baur Vairina': 'picnirvana/baur.png',
        'Vairina Arcs': 'picnirvana/arcs.png',
        'Dragontree Deity of Resurgence, Dragveda': 'picnirvana/dragveda_resurgence.png',

        // Triggers - Dragon Empire
        'Critical Trigger (Dragon Empire)': 'overlord/crit.png',
        'Draw Trigger (Dragon Empire)': 'overlord/draw.png',
        'Heal Trigger (Dragon Empire)': 'overlord/heal.png',

        // Keter Sanctuary Deck
        'Wingul Brave': 'majes/wingul_brave.png',
        'Little Sage, Maron': 'majes/maron.png',
        'Blaster Blade': 'majes/blaster_blade.png',
        'Blaster Dark': 'majes/blaster_dark.png',
        'Majesty Lord Blaster': 'majes/majesty_lord_blaster.png',
        'Knight of Inheritance, Emmeline': 'majes/emmeline.png',
        'Palladium Zeal Dragon (PG)': 'majes/palladium_zeal.png',
        'Ordeal Dragon': 'majes/ordeal_dragon.png',
        'Knight of Old Fate, Cordiela': 'majes/cordiela.png',
        'Painkiller Angel': 'majes/painkiller_angel.png',
        'Departure Towards the Dawn': 'majes/departure_dawn.png',

        'Critical Trigger (Keter)': 'majes/critical_keter.png',
        'Front Trigger (Keter)': 'majes/front_keter.png',
        'Heal Trigger (Keter)': 'majes/heal_keter.png',
        'Light Dragon Deity of Honors, Amartinoa': 'majes/amartinoa.png',

        // Brandt Gate - Avantgarda
        'Blue Deathster, Sora Period': 'avantgarda/sora.png',
        'Blue Deathster, "Dark Verdict" Findanis': 'avantgarda/findanis.png',
        'Blue Deathster, "Heavenly Death Ray" Stelvane': 'avantgarda/stelvane.png',
        'Blue Deathster, "Skyrender" Avantgarda': 'avantgarda/avant_original.png',
        'Blue Deathster, "Skyrendriver" Avantgarda Richter': 'avantgarda/richter.png',
        'Shock Strategy: Death Winds': 'avantgarda/death_winds.png',
        'Bomber Strategy: Dusting': 'avantgarda/bomber_dusting.png',
        'Disruption Strategy: Killshroud': 'avantgarda/killshroud.png',
        'Ala Dargente': 'avantgarda/ala_dargente.png',
        'Sickle Blade of Inquest, Habitable Zone': 'avantgarda/habitable_zone.png',
        'Blue Deathster, Asagi Milestone': 'avantgarda/asagi.png',
        'Blue Deathster, Hanada Halfway': 'avantgarda/hanada_halfway.png',
        'Automated Belstul (Perfect Guard)': 'avantgarda/belstul_pg.png',

        'Critical Trigger (Brandt Gate)': 'avantgarda/brandt_crit.png',
        'Draw Trigger (Brandt Gate)': 'avantgarda/brandt_draw.png',
        'Heal Trigger (Brandt Gate)': 'avantgarda/brandt_heal.png',
        'Star Dragon Deity of Infinitude, Eldobreath': 'avantgarda/eldobreath.png',

        // Keter Sanctuary - Youthberk
        'Youth Following in Footsteps, Youth': 'youthberk/grade0.png',
        'Determined to Break Away, Youth': 'youthberk/grade1.png',
        'Knight of Ardent Light, Youth': 'youthberk/grade2.png',
        'Youthberk "Skyfall Arms"': 'youthberk/skyfall.png',
        'Youthberk "RevolForm: Tempest"': 'youthberk/tempest.png',
        'Youthberk "RevolForm: Gust"': 'youthberk/gust.png',
        'Knight of Fracture, Schneizal': 'youthberk/schneizal.png',
        'Knight of Plowing, Dolbraig': 'youthberk/dolbraig.png',
        'Knight of Rendering Flash, Cairbre': 'youthberk/cairbre.png',
        'Witch of Accumulation, Sequana': 'youthberk/sequana.png',
        'Wayward Therapy Angel': 'youthberk/wayward.png',

        // Dragon Empire - Dragonic Overlord the End
        'Lizard Runner, Undeux': 'overlord/undeux.png',
        'Embodiment of Armor, Bahr': 'overlord/bahr.png',
        'Dragon Knight, Nehalem': 'overlord/nehalem.png',
        'Dragonic Overlord the End': 'overlord/dote.png',
        'Dragonic Overlord': 'overlord/do.png',
        'Gratias Gradale': 'overlord/gratias.png',
        'Blast Artillery Dragon, Brachioforce': 'overlord/brachioforce.png',
        'Burning Horn Dragon': 'overlord/burning_horn.png',
        'Ardor Hatchet Dragon': 'overlord/ardor_hatchet.png',
        'Dragritter, Halbe': 'overlord/halbe.png',
        'Dragon Monk, Gojo': 'overlord/gojo.png',
        'Sparkle Rejector Dragon (PG)': 'overlord/pg.png',
        'Dragon Empire Critical Trigger': 'overlord/crit.png',
        'Dragon Empire Draw Trigger': 'overlord/draw.png',
        'Dragon Empire Heal Trigger': 'overlord/heal.png',
        'Dragveda': 'overlord/over.png',

        // Dark States - Greedon
        'Desire Devil, Taida': 'greedon/taida.png',
        'Desire Devil, Gouman': 'greedon/gouman.png',
        'Desire Devil, Boshokku': 'greedon/boshokku.png',
        'Avaricious Demonic Dragon, Greedon': 'greedon/greedon.png',
        'Avaricious Demonic Dragon King, Greedon Masques': 'greedon/greedon_masques.png',
        'Masque of Hydragrum': 'greedon/masque_hydragrum.png',
        'Desire Devil, Fuujo': 'greedon/fuujo.png',
        'Clean-sweep Dragon': 'greedon/clean_sweep.png',
        'Dragontree Wretch, Skull Chemdah': 'greedon/chemdah.png',
        'Desire Devil, Saasyou': 'greedon/saasyou.png',
        'Desire Devil, Mousheen': 'greedon/mousheen.png',
        'Desire Devil, Xitto': 'greedon/xitto.png',

        'Critical Trigger (Dark States)': 'picture/bruce_crit.png',
        'Draw Trigger (Dark States)': 'picture/bruce_draw.png',
        'Front Trigger (Dark States)': 'picture/bruce_front.png',
        'Heal Trigger (Dark States)': 'picture/bruce_heal.png',
        'Hades Dragon Deity, Gallmageveld': 'picture/bruce_over.png',

        // Brandt Gate - Prison (Seraph Snow)
        'Aurora Battle Princess, Ruby Red': 'seraph_art/ruby_red.png',
        'Aurora Battle Princess, Kyanite Blue': 'seraph_art/kyanite_blue.png',
        'Aurora Battle Princess, Risatt Pink': 'seraph_art/risatt_pink.png',
        'Aurora Battle Princess, Seraph Snow': 'seraph_art/seraph_snow.png',
        'Aurora Fierce Princess, Seraph Purelight': 'seraph_art/seraph_purelight.png',
        'Aurora Battle Princess, Penetrate Aquas': 'seraph_art/penetrate_aquas.png',
        'Aurora Battle Princess, Launcher Charleen': 'seraph_art/launcher_charleen.png',
        'Aurora Battle Princess, Derii Violet': 'seraph_art/derii_violet.png',
        'Aurora Battle Princess, Accuse Makarite': 'seraph_art/accuse_makarite.png',
        'Aurora Battle Princess, Cuff Spring': 'seraph_art/cuff_spring.png',
        'Galaxy Central Prison, Galactolus': 'seraph_art/galactolus.png',
        'Security Upgrader': 'seraph_art/security_upgrader.png',
        'Aurora Battle Princess, Grenade Marieda': 'seraph_art/grenade_marieda.png',
        'Blitz Staff, Muna': 'seraph_art/muna.png',
        'Aurora Battle Princess, Lifle Royar': 'seraph_art/lifle_royar.png',
        'Front Trigger (Brandt Gate)': 'avantgarda/brandt_front.png'
    };

    // --- Deck Definitions ---
    const bruceDeck = {
        rideDeck: [
            { name: 'Diabolos, "Innocent" Matt', grade: 0, power: 6000, shield: 10000, skill: '[AUTO]: เมื่อถูกไรด์ทับ ถ้าคุณเริ่มเป็นคนที่สอง จั่วการ์ด 1 ใบ' },
            { name: 'Diabolos, "Bad" Steve', grade: 1, power: 8000, shield: 5000, skill: '[AUTO]: เมื่อยูนิทนี้วางบน (VC) เลือกการ์ด 1 ใบจากโซลของคุณ คอลลงช่อง (RC) แถวหลังตรงกลาง และ [Soul-Charge 1]\n[CONT](RC): ถ้าอยู่ในสถานะ "Final Rush" ยูนิทนี้ได้รับพลัง +5000' },
            { name: 'Diabolos, "Anger" Richard', grade: 2, power: 10000, shield: 5000, skill: '[AUTO]: เมื่อยูนิทนี้วางบน (VC) [คอสต์][นำเรียร์การ์ด 1 ใบเข้าสู่โซล] จั่วการ์ด 1 ใบ\n[CONT](RC): ถ้าอยู่ในสถานะ "Final Rush" ยูนิทนี้ได้รับพลัง +5000' },
            { name: "Diabolos, \"Viamance\" Bruce", grade: 3, power: 13000, persona: true, skill: "[AUTO](V): เมื่อเริ่มแบทเทิลเฟสของคุณ ถ้ายูนิททั้งหมดของคุณมีคำว่า \"เดียโบลอส\" คุณจะเข้าสู่สถานะ \"พลังบุกชั่วอึดใจ\" จนจบเทิร์นถัดไปของคู่แข่ง และถ้าแวนการ์ดคู่แข่งเป็นเกรด 3 หรือสูงกว่า จะเข้าสู่สถานะ \"พลังระเบิกเฮือกสุดท้าย\"\n[AUTO](V): เมื่อยูนิทนี้โจมตี ในสถานะพลังระเบิดเฮือกสุดท้าย [CB1] เลือกแถวแนวตั้ง 1 แถว Stand เรียร์การ์ดเดียโบลอสทั้งหมดในแถวนั้น และได้รับพลัง +5000" }
        ],
        mainDeck: [
            // G3 (6 cards total - excluding ride deck Bruce)
            ...Array(3).fill({ name: 'Diabolos, "Viamance" Bruce', grade: 3, power: 13000, persona: true, skill: 'Persona Ride: Front row +10000\n[AUTO](V): เมื่อเริ่มแบทเทิลเฟส... (เหมือนตัว Ride Deck)' }),
            ...Array(3).fill({ name: 'Diabolos Diver, Julian', grade: 3, power: 13000, skill: '[AUTO](RC)[1/turn]: เมื่อยูนิทนี้โจมตีแวนการ์ด, [คอสต์][Counter-Blast 1], ยูนิทนี้ได้รับพลัง+2000 จนจบเทิร์น ต่อการ์ดทุกๆ 1 ใบในดาเมจโซนของคุณ หากคุณมีแวนการ์ดที่มีชื่อ "Bruce", และทำการ [Soul-Charge 1] ต่อดาเมจทุกๆ 2 ใบ เลือกการ์ดในโซลของคุณสูงสุดตามจำนวนที่ [Soul-Charge] ด้วยผลนี้ คอลลง (RC) ที่ว่างอยู่' }),

            // G2 (15 cards total)
            ...Array(4).fill({ name: 'Diabolos Madonna, Megan', grade: 2, power: 10000, shield: 5000, skill: '[AUTO](R): เมื่อยูนิทนี้โจมตี ในสถานะพลังบุกชั่วอึดใจ ยูนิทนี้ได้รับพลัง+10000 จนจบเทิร์น' }),
            ...Array(4).fill({ name: 'Diabolos Boys, Eden', grade: 2, power: 10000, shield: 5000, skill: '[CONT](R): ถ้าอยู่ในสถานะพลังบุกชั่วอึดใจ ได้รับพลัง +5000\n[CONT](R): ถ้าเคย Stand ด้วยความสามารถในเทิร์นนี้ ได้รับ Critical +1\n[AUTO](R): เมื่อโจมตีฮิต [CB1] รีไทร์เรียร์การ์ดคู่แข่ง 1 ใบ' }),
            ...Array(3).fill({ name: 'Diabolos Buckler, Jamil', grade: 2, power: 10000, shield: 5000, skill: '[CONT](RC)/(GC): หากอยู่ในสถานะ "Final Burst" ยูนิทนี้ได้รับ พลัง+10000/โล่+5000 (ทำงานในเทิร์นคู่แข่งด้วย)\n[AUTO]: เมื่อวางบนช่อง (RC) หากแวนการ์ดคือ "Diabolos, \"Viamance\" Bruce", [คอสต์][Counter-Blast 1], [Soul-Charge 1], เลือกการ์ดนอร์มอลยูนิทที่มีชื่อ "Diabolos" เกรด 3 หรือต่ำกว่า 1 ใบจากโซล คอลลง (RC) ที่ว่างอยู่' }),
            ...Array(4).fill({ name: 'Recusal Hate Dragon (Perfect Guard)', grade: 1, power: 8000, shield: 0, isPG: true, skill: '[Sentinel] (Perfect Guard)\n[AUTO]: เมื่อยูนิทนี้เข้าสู่ G เลือกยูนิทคุณ 1 ใบ ยูนิทนั้นไม่ถูกฮิตจนจบการต่อสู้ ถ้าคุณมีการ์ดในมือตั้งแต่ 2 ใบขึ้นไป ทิ้งการ์ด 1 ใบ' }),

            // G1 (13 cards total)
            ...Array(4).fill({ name: 'Diabolos Girls, Stefanie', grade: 1, power: 8000, shield: 5000, skill: '[CONT](RC): ในสถานะ "Final Rush" ยูนิทอื่นทั้งหมดของคุณในแถวแนวตั้งเดียวกับยูนิทนี้ได้รับพลัง +5000 (ทำงานในเทิร์นคู่แข่งด้วย)' }),
            ...Array(3).fill({ name: 'Diabolos Madonna, Mabel', grade: 1, power: 7000, shield: 5000, skill: '[AUTO](RC): เมื่อยูนิทนี้บูสต์แวนการ์ด ในสถานะ "Final Rush" [CB1] แวนการ์ดได้รับ "Triple Drive" จนจบเทิร์น' }),
            ...Array(2).fill({ name: 'Diabolos Girls, Ivanka', grade: 1, power: 8000, shield: 5000, skill: '[AUTO](RC): เมื่อยูนิทที่บูสต์ด้วยยูนิทนี้โจมตีฮิตแวนการ์ด ในสถานะ "Final Rush" [คอสต์][CB1 & นำเรียร์การ์ดที่ยูนิทนี้บูสต์ไปไว้ใต้กอง] จั่วการ์ด 1 ใบ เลือกยูนิทอื่นของคุณ 1 ใบ ได้รับพลัง +5000 จนจบเทิร์น' }),

            // Triggers (16 cards total)
            ...Array(8).fill({ name: 'Critical Trigger (Dark States)', grade: 0, power: 5000, shield: 15000, trigger: 'Critical' }),
            ...Array(2).fill({ name: 'Draw Trigger (Dark States)', grade: 0, power: 5000, shield: 5000, trigger: 'Draw' }),
            ...Array(1).fill({ name: 'Front Trigger (Dark States)', grade: 0, power: 5000, shield: 15000, trigger: 'Front' }),
            ...Array(4).fill({ name: 'Heal Trigger (Dark States)', grade: 0, power: 5000, shield: 15000, trigger: 'Heal' }),
            { name: 'Hades Dragon Deity, Gallmageveld', grade: 0, power: 5000, shield: 50000, trigger: 'Over', overPower: '100 Million' }
        ].sort(() => 0.5 - Math.random()) // Shuffle main deck
    };

    function generateMainDeck(unitPool, triggerPool) {
        let deck = [];
        for (let i = 0; i < 16; i++) {
            deck.push({ ...triggerPool[i % triggerPool.length], id: `trigger-${i}` });
        }
        for (let i = 0; i < 30; i++) {
            deck.push({ ...unitPool[i % unitPool.length], id: `unit-${i}` });
        }
        return deck.sort(() => 0.5 - Math.random());
    }

    const magnoliaDeck = {
        rideDeck: [
            { name: 'Sylvan Horned Beast, Lotte', grade: 0, power: 6000, shield: 10000, skill: '[AUTO]: เมื่อถูกไรด์ทับ ถ้าคุณเริ่มเป็นคนที่สอง จั่วการ์ด 1 ใบ' },
            { name: 'Sylvan Horned Beast, Charis', grade: 1, power: 8000, shield: 5000, skill: '[ACT](VC)[1/turn]: [คอสต์][Soul-Blast 1] จั่วการ์ด 2 ใบ จากนั้นเลือกการ์ดออเดอร์จากบนมือคุณสูงสุด 1 ใบเพื่อทิ้ง หากไม่ได้ทิ้งด้วยผลนี้ เลือกทิ้งการ์ด 2 ใบจากบนมือคุณ\n[CONT](RC): ถ้าคุณใช้งานออเดอร์ในเทิร์นนี้ ยูนิทนี้ได้รับพลัง +2000' },
            { name: 'Sylvan Horned Beast, Lattice', grade: 2, power: 10000, shield: 5000, skill: '[ACT](RC): ถ้าแวนการ์ดของคุณมีชื่อ "Magnolia" และแวนการ์ดคู่แข่งเกรด 3 หรือสูงกว่า [คอสต์][Counter-Blast 1 & นำยูนิทนี้เข้าสู่โซล] เลือกเกรด 4 ที่มีชื่อ "Magnolia" จากบนมือคุณ 1 ใบแล้วไรด์ในสถานะ Stand' },
            { name: 'Sylvan Horned Beast King, Magnolia', grade: 3, power: 13000, persona: true, skill: '[AUTO](VC): เมื่อจบการโจมตีแบทเทิลที่ยูนิทนี้โจมตี [คอสต์][Counter-Blast 1] เลือกเรียร์การ์ดของคุณ 1 ใบจนจบเทิร์นยูนิทนั้นสามารถโจมตีจากแถวหลังได้และได้รับพลัง +5000 หากคุณทำเพอร์โซน่าไรด์ในเทิร์นนี้ เลือกได้ 3 ใบแทน 1 ใบ' }
        ],
        mainDeck: [
            // Grade 4
            ...Array(4).fill({ name: 'Sylvan Horned Beast Emperor, Magnolia Elder', grade: 4, power: 13000, skill: '[AUTO]: เมื่อวางบน (VC) เลือกการ์ด 1 ใบจากโซล คอลลง (RC)\n[CONT](VC): หากมี "Magnolia" ในโซลหรือบน (RC) ของคุณ เรียร์การ์ดทั้งหมดสามารถโจมตีและอินเตอร์เซปต์จากแถวหลังได้ และได้รับพลัง +5000' }),

            // Grade 3 (Listed as G3 by user, but Winnsapooh is G1 base with reduction)
            ...Array(3).fill({ name: 'Blue Artillery Dragon, Inlet Pulse Dragon', grade: 3, power: 13000, skill: '[AUTO](RC): เมื่อจบเทิร์นของคุณ หากมีการโจมตี 4 ครั้งขึ้นไปในเทิร์นนี้ [คอสต์][นำยูนิทนี้เข้าสู่โซล] จั่วการ์ด 1 ใบ' }),
            ...Array(2).fill({ name: 'Sylvan Horned Beast, Winnsapooh', grade: 3, power: 13000, skill: '[CONT]Deck/Hand: หากมีแวนการ์ด "Sylvan Horned Beast" เกรด 2 ขึ้นไปที่ไม่ใช่ชื่อตัวมันเอง การ์ดนี้เกรด -1\n[CONT](RC): หากแวนการ์ด "Magnolia" ถูกวางในเทิร์นนี้ ยูนิทนี้ได้รับพลัง +10000' }),

            // Grade 2
            ...Array(1).fill({ name: 'Sylvan Horned Beast, Bojalcorn', grade: 2, power: 10000, shield: 5000, skill: '[ACT](RC): [CB1] จนจบเทิร์น ยูนิทนี้ได้รับ "[CONT]Back Row (RC): เมื่อยูนิทนี้โจมตี จะโจมตีแถวหน้าคู่แข่งทั้งหมด"' }),
            ...Array(1).fill({ name: 'Sylvan Horned Beast, Gabregg', grade: 2, power: 10000, shield: 5000, skill: '[AUTO](RC): เมื่อยูนิทอื่นในแถวเดียวกับใบนี้โจมตี [SB1] พลัง+10000 และมอบ Guard Restrict ตามเกรดแถวหน้าคู่แข่ง' }),
            ...Array(3).fill({ name: 'Sylvan Horned Beast, Giunosla', grade: 2, power: 10000, shield: 5000, skill: '[AUTO]Back Row (RC): เมื่อยูนิทนี้โจมตี [CB1] เลือกเรียร์การ์ดใบอื่น 1 ใบ ยูนิทนั้นได้รับพลังเท่ากับพลังของยูนิทนี้จนจบเทิร์น' }),
            ...Array(3).fill({ name: 'Sylvan Horned Beast, Enpix', grade: 2, power: 10000, shield: 5000, skill: '[CONT]Back Row (RC): ยูนิทนี้ได้รับพลัง +10000 และถ้าคุณมีเรียร์การ์ดไม่เกิน 3 ใบ ยูนิททั้งหมดในแถวแนวตั้งเดียวกับยูนิทนี้จะไม่ถูกเลือกโดยความสามารถการ์ดของคู่แข่ง' }),
            ...Array(2).fill({ name: 'Sylvan Horned Beast, Goildoat', grade: 2, power: 10000, shield: 5000, skill: '[AUTO]Drop: เมื่อไรด์ Magnolia [เข้าโซล] VG พลัง+5000\n[AUTO](R): โจมตีจากแถวหลังพลัง+10000 ถ้าอยู่แถวกลางจบการต่อสู้ [Retire] จั่ว 1' }),
            ...Array(1).fill({ name: 'Sylvan Horned Beast, Alpin', grade: 2, power: 10000, shield: 5000, skill: '[AUTO](RC): เมื่อโจมตี VG ถ้าแวนการ์ดคือ Magnolia พลัง+5000 ต่อ G2 ทุก 2 ใบ ถ้า+10000 ขึ้นไป จบการต่อสู้ [Bind] CC1/SC1' }),

            // Grade 1
            ...Array(4).fill({ name: 'Spiritual Body Condensation', grade: 1, power: 0, shield: 0, skill: '[Order]: [SB1] เลือกการ์ดเกรดไม่เกินแวนการ์ด 1 ใบจากดรอปโซนคอลลง (RC) และใบนั้นได้รับพลัง +5000 จนจบเทิร์น' }),
            ...Array(2).fill({ name: 'In the Dim Darkness, the Frozen Resentment', grade: 1, power: 0, shield: 0, skill: '[Order]: [SB1] ดูการ์ด 3 ใบจากบนสุดของกอง เลือก 1 ใบเพื่อทิ้ง สับกอง จากนั้นเลือกการ์ดเกรดไม่เกินแวนการ์ด 1 ใบจากดรอปโซนคอลลง (RC)' }),
            ...Array(4).fill({ name: 'Custodial Dragon (Perfect Guard)', grade: 1, power: 8000, shield: 0, isPG: true, skill: '[Sentinel] (Perfect Guard)' }),

            // Triggers
            ...Array(8).fill({ name: 'Critical Trigger (Stoicheia)', grade: 0, power: 5000, shield: 15000, trigger: 'Critical' }),
            ...Array(3).fill({ name: 'Front Trigger (Stoicheia)', grade: 0, power: 5000, shield: 15000, trigger: 'Front' }),
            ...Array(4).fill({ name: 'Heal Trigger (Stoicheia)', grade: 0, power: 5000, shield: 15000, trigger: 'Heal' }),
            { name: 'Source Dragon Deity, Blessfavor', grade: 0, power: 5000, shield: 50000, trigger: 'Over', overPower: '100 Million' }
        ]
            .sort(() => 0.5 - Math.random())
    };

    const nirvanaJhevaDeck = {
        rideDeck: [
            { name: 'Sunrise Egg', grade: 0, power: 6000, shield: 10000, skill: '[AUTO]: เมื่อถูกไรด์ทับ ถ้าคุณเริ่มเป็นคนที่สอง จั่วการ์ด 1 ใบ' },
            { name: 'Heart-pounding Blaze Maiden, Rino', grade: 1, power: 8000, shield: 5000, skill: '[AUTO]: เมื่อถูกไรด์ทับโดย "Snuggling Blaze Maiden, Reiyu" ค้นหา "Trickstar" 1 ใบจากกองการ์ดคอลลง (RC) และสับกอง\n[CONT](RC): ในเทิร์นของคุณ หากมี <Prayer Dragon> ในแถวเดียวกัน พลัง+5000' },
            { name: 'Snuggling Blaze Maiden, Reiyu', grade: 2, power: 10000, shield: 5000, skill: '[AUTO]: เมื่อถูกไรด์ทับโดย "Nirvana Jheva" ดูการ์ด 7 ใบจากบนสุดของกอง เลือก <Prayer Dragon> 1 ใบขึ้นมือ และสับกอง\n[CONT](RC): ในเทิร์นของคุณ หากมี <Prayer Dragon> ในแถวเดียวกัน พลัง+5000' },
            { name: 'Chakrabarthi Pheonix Dragon, Nirvana Jheva', grade: 3, power: 13000, persona: true, skill: '[ACT](VC)[1/Turn]: [ทิ้งการ์ด 1 ใบ] เลือก "Trickstar" 1 ใบ และ <Prayer Dragon> 1 ใบจากดรอบคอลลง (RC)\n[AUTO](VC): เมื่อโจมตี [CB1] เลือกเรียร์การ์ด 1 ใบที่อยู่ในสถานะ [XoverDress] และ Stand ยูนิทนั้น' }
        ],
        mainDeck: [
            ...Array(4).fill({ name: 'Trickstar', grade: 0, power: 5000, shield: 5000, skill: '[CONT](RC): ไม่สามารถถูกเลือกโดยความสามารถการ์ดของคู่แข่ง' }),
            ...Array(4).fill({ name: 'Sparkle Rejector Dragon (Perfect Guard)', grade: 1, power: 8000, shield: 0, isPG: true, skill: '[Sentinel] (Perfect Guard)' }),
            ...Array(3).fill({ name: 'Illuminate Equip Dragon, Graillumirror', grade: 1, power: 8000, shield: 5000, skill: '[AUTO](RC): เมื่อแวนการ์ด "Nirvana" โจมตี [CB1] เลือกเรียร์การ์ดสถานะ overDress หรือ X-overDress 1 ใบ Stand' }),
            ...Array(3).fill({ name: 'Strike Equip Dragon, Stragallio', grade: 1, power: 8000, shield: 5000, skill: '[AUTO]: เมื่อวางบน (RC) จากบนมือ ถ้าแวนมีชื่อ "Nirvana" [ทิ้งการ์ด 1 ใบ] ค้นหาการ์ดที่มีความสามารถ [overDress] หรือ "Trickstar" 1 ใบขึ้นมือและสับกอง\n[AUTO]: เมื่อตกอยู่ในสถานะ originalDress [CB1] เลือก "Trickstar" จากดรอบคอลลง (RC)' }),
            ...Array(3).fill({ name: 'Sword Equip Dragon, Galondight', grade: 2, power: 10000, shield: 5000, skill: '[AUTO]: เมื่อถูกนำไปซ้อนใต้ร่าง X-overDress เลือกยูนิทที่ซ้อนทับ พลัง+5000 จนจบเทิร์น (ถ้าเป็น Garou Vairina พลัง+5000 แทนที่จะเป็น +5000)' }),
            ...Array(4).fill({ name: 'Mirror Reflection Equip, Mirrors Vairina', grade: 2, power: 10000, shield: 5000, skill: 'X-overDress: "Trickstar" & "Graillumirror"\n[AUTO]: เมื่อลง (RC) ด้วย X-overDress เลือก "Vairina" 2 ใบจากดรอบมาซ้อนใต้การ์ดนี้\n[AUTO](RC): เมื่อโจมตี พลัง+10000 จากนั้น [ทิ้งการ์ด Vairina ที่ซ้อนอยู่ 1 ใบ] เลือก "จั่วการ์ด 1 ใบ" หรือ "CC1"' }),
            ...Array(2).fill({ name: 'Jeweled Sword Equip, Garou Vairina', grade: 2, power: 10000, shield: 5000, skill: 'X-overDress: "Trickstar" & "Galondight"\n[CONT](RC): หากอยู่ในสถานะ X-overDress พลัง+10000 และเมื่อยูนิทนี้โจมตี คู่แข่งต้องคอลการ์ดจากบนมือลง (GC) ครั้งละ 2 ใบขึ้นไป' }),
            ...Array(1).fill({ name: 'Flaring Cannon Equip, Baur Vairina', grade: 3, power: 13000, skill: '[XoverDress]-One "Trickstar" and one <Prayer Dragon> unit\n[ACT](RC): หากอยู่ในสถานะ X-overDress [SB2] เลือกเรียร์การ์ดคู่แข่ง 1 ใบและรีไทร์\n[AUTO](RC): เมื่อโจมตีแวนการ์ดในสถานะ X-overDress พลัง+2000 ต่อช่อง RC ที่ว่างของคู่แข่ง และถ้าคู่แข่งมีเรียร์การ์ด 1 ใบหรือน้อยกว่า [CB1] ยูนิทนี้ Drive-1 และทำการ Drive Check' }),
            ...Array(2).fill({ name: 'Vairina Arcs', grade: 2, power: 10000, shield: 5000, skill: '[overDress]-"Trickstar"\n[AUTO]: เมื่อลง (RC) ในสถานะ overDress [CB1] จั่วการ์ด 2 ใบและพลัง+5000' }),
            ...Array(3).fill({ name: 'Chakrabarthi Pheonix Dragon, Nirvana Jheva', grade: 3, power: 13000, persona: true, skill: '[ACT](VC)[1/Turn]: [ทิ้งการ์ด 1 ใบ] เลือก "Trickstar" 1 ใบ และ <Prayer Dragon> 1 ใบจากดรอบคอลลง (RC)\n[AUTO](VC): เมื่อโจมตี [CB1] เลือกเรียร์การ์ด 1 ใบที่อยู่ในสถานะ [XoverDress] และ Stand ยูนิทนั้น' }),

            ...Array(7).fill({ name: 'Critical Trigger (Dragon Empire)', grade: 0, power: 5000, shield: 15000, trigger: 'Critical' }),
            ...Array(4).fill({ name: 'Draw Trigger (Dragon Empire)', grade: 0, power: 5000, shield: 5000, trigger: 'Draw' }),
            ...Array(4).fill({ name: 'Heal Trigger (Dragon Empire)', grade: 0, power: 5000, shield: 15000, trigger: 'Heal' }),
            { name: 'Dragontree Deity of Resurgence, Dragveda', grade: 0, power: 5000, shield: 50000, trigger: 'Over', overPower: '100 Million' }
        ].sort(() => 0.5 - Math.random())
    };

    const majestyDeck = {
        rideDeck: [
            { name: 'Wingul Brave', grade: 0, power: 6000, shield: 10000, skill: '[AUTO]: เมื่อถูกไรด์ทับ ถ้าคุณเริ่มเป็นคนที่สอง จั่วการ์ด 1 ใบ' },
            { name: 'Little Sage, Maron', grade: 1, power: 8000, shield: 5000, skill: '[AUTO]: เมื่อถูกไรด์ทับโดยเกรด 2 ที่มีคำว่า "Blaster" ดูการ์ด 7 ใบจากบนสุดของกอง เลือกเกรด 2 ที่มีคำว่า "Blaster" ไม่เกิน 1 ใบขึ้นมือและสับกอง หากไม่ได้นำการ์ดขึ้นมือ สามารถเรียก "Wingul Brave" 1 ใบจากโซลคอลลง (RC)\n[CONT](RC): ในเทิร์นของคุณ หากคุณมียูนิท 3 ใบขึ้นไป ยูนิทนี้ได้รับพลัง+2000' },
            { name: 'Blaster Blade', grade: 2, power: 10000, shield: 5000, skill: '[AUTO]: เมื่อวางบน (VC) [CB1] เลือกรีไทร์เรียร์การ์ดคู่แข่ง 1 ใบ หากไม่รีไทร์ จั่วการ์ด 1 ใบ\n[AUTO]: เมื่อวางบน (RC) [CB1] เลือกรีไทร์เรียร์การ์ดเกรด 2 หรือสูงกว่าของคู่แข่ง 1 ใบ' },
            { name: 'Majesty Lord Blaster', grade: 3, power: 13000, persona: true, skill: '[CONT](VC): หากในโซลมี "Blaster Blade" และ "Blaster Dark" ยูนิทนี้ได้รับ พลัง+2000/คริติคอล+1 (ทำงานในเทิร์นคู่แข่งด้วย)\n[AUTO](VC): เมื่อโจมตีแวนการ์ด สามารถเลือกทำอย่างใดอย่างหนึ่งดังนี้\n・[นำ "Blaster Blade" จาก (RC) เข้าโซล] เลือกรีไทร์เรียร์การ์ดคู่แข่ง 1 ใบ และยูนิทนี้พลัง +10000\n・[นำ "Blaster Dark" จาก (RC) เข้าโซล] ยูนิทนี้ได้รับพลัง +10000/ไดร์ฟ+1 จนจบเทิร์น' }
        ],
        mainDeck: [
            ...Array(3).fill({ name: 'Majesty Lord Blaster', grade: 3, power: 13000, persona: true, skill: '[CONT](VC): หากในโซลมี "Blaster Blade" และ "Blaster Dark" ยูนิทนี้ได้รับ พลัง+2000/คริติคอล+1 (ทำงานในเทิร์นคู่แข่งด้วย)\n[AUTO](VC): เมื่อโจมตีแวนการ์ด สามารถเลือกทำอย่างใดอย่างหนึ่งดังนี้\n・[นำ "Blaster Blade" จาก (RC) เข้าโซล] เลือกรีไทร์เรียร์การ์ดคู่แข่ง 1 ใบ และยูนิทนี้พลัง +10000\n・[นำ "Blaster Dark" จาก (RC) เข้าโซล] ยูนิทนี้ได้รับพลัง +10000/ไดร์ฟ+1 จนจบเทิร์น' }),
            ...Array(3).fill({ name: 'Blaster Blade', grade: 2, power: 10000, shield: 5000, skill: '[AUTO]: เมื่อวางบน (VC) [CB1] เลือกรีไทร์เรียร์การ์ดคู่แข่ง 1 ใบ หากไม่รีไทร์ จั่วการ์ด 1 ใบ\n[AUTO]: เมื่อวางบน (RC) [CB1] เลือกรีไทร์เรียร์การ์ดเกรด 2 หรือสูงกว่าของคู่แข่ง 1 ใบ' }),
            ...Array(4).fill({ name: 'Blaster Dark', grade: 2, power: 10000, shield: 5000, skill: '[AUTO](VC/RC): [CB1 & Retire 1 another RG] เลือกรีไทร์เรียร์การ์ดคู่แข่ง 1 ใบ และยูนิทนี้ได้รับไดร์ฟ+1 จนจบเทิร์น\n[CONT](RC): ในเทิร์นของคุณ หากมีเรียร์การ์ดของคุณถูกรีไทร์ในเทิร์นนี้ พลัง+5000' }),
            ...Array(4).fill({ name: 'Knight of Inheritance, Emmeline', grade: 2, power: 10000, shield: 5000, skill: '[AUTO]: เมื่อลง (RC) จากบนมือ [SB1] ดู 5 ใบ เลือก "Blaster" 1 ใบ คอลลง (RC) หรือนำขึ้นมือแล้วทิ้งการ์ด 1 ใบ\n[AUTO](RC): เมื่อยูนิทที่มีชื่อ "Blaster" ของคุณโจมตี ยูนิทนี้พลัง +5000 จนจบเทิร์น' }),
            ...Array(4).fill({ name: 'Palladium Zeal Dragon (PG)', grade: 1, power: 8000, shield: 0, isPG: true, skill: '[Sentinel] (Perfect Guard)\n[AUTO]: เมื่อยูนิทนี้เข้าสู่ G เลือกยูนิทคุณ 1 ใบ ยูนิทนั้นไม่ถูกฮิตจนจบการต่อสู้ ถ้าคุณมีการ์ดในมือตั้งแต่ 2 ใบขึ้นไป ทิ้งการ์ด 1 ใบ' }),
            ...Array(4).fill({ name: 'Ordeal Dragon', grade: 1, power: 8000, shield: 5000, skill: '[CONT](RC): ในเทิร์นของคุณ หากมี "Blaster Blade" และ "Blaster Dark" ในโซล พลัง+5000\n[AUTO](RC): เมื่อจบการต่อสู้ที่ยูนิทนี้โจมตีหรือบูสต์ [นำยูนิทนี้เข้าโซล] ดูการ์ด 7 ใบจากบนกอง เลือก "Blaster" 1 ใบขึ้นมือและสับกอง' }),
            ...Array(4).fill({ name: 'Knight of Old Fate, Cordiela', grade: 1, power: 8000, shield: 5000, skill: '[CONT] Back Row Center (RC): หากแวนการ์ดคือ "Majesty Lord Blaster" จะได้รับ\n・[AUTO](RC): เมื่อบูสต์เสร็จ [CB1] คอล Blade และ Dark จากโซลลงคอลัมน์เดียวกัน\n・[CONT](RC): หากแวนคู่แข่ง G3+ เรียร์การ์ด G2 ทั้งหมดของคุณได้รับ "Boost"' }),
            ...Array(2).fill({ name: 'Painkiller Angel', grade: 1, power: 8000, shield: 5000, skill: '[AUTO](RC): เมื่อจบการต่อสู้ที่ยูนิทนี้บูสต์ [SB1 & Retire ตัวเอง] จั่วการ์ด 1 ใบ' }),
            ...Array(2).fill({ name: 'Departure Towards the Dawn', grade: 1, power: 0, shield: 0, skill: '[Order]: [CB1] ดูการ์ด 5 ใบจากบนกอง เลือก "Blaster" 1 ใบขึ้นมือและสับกอง' }),
            ...Array(8).fill({ name: 'Critical Trigger (Keter)', grade: 0, power: 5000, shield: 15000, trigger: 'Critical' }),
            ...Array(3).fill({ name: 'Front Trigger (Keter)', grade: 0, power: 5000, shield: 15000, trigger: 'Front' }),
            ...Array(4).fill({ name: 'Heal Trigger (Keter)', grade: 0, power: 5000, shield: 15000, trigger: 'Heal' }),
            { name: 'Light Dragon Deity of Honors, Amartinoa', grade: 0, power: 5000, shield: 50000, trigger: 'Over', overPower: '100 Million' }
        ].sort(() => 0.5 - Math.random())
    };

    const avantgardaDeck = {
        rideDeck: [
            { name: 'Blue Deathster, Sora Period', grade: 0, power: 6000, shield: 10000, skill: '[AUTO]: เมื่อถูกไรด์ทับ ถ้าคุณเริ่มเป็นคนที่สอง จั่วการ์ด 1 ใบ' },
            { name: 'Blue Deathster, "Dark Verdict" Findanis', grade: 1, power: 8000, shield: 5000, skill: '[AUTO]: เมื่อถูกไรด์ทับโดย "Heavenly Death Ray" Stelvane ค้นหา Strategy 1 ใบจากในกองขึ้นมือ\n[CONT](RC): เมื่อยูนิทนี้บูสต์ ถ้ามี Strategy Card ถูกเข้าโซล(ใช้งาน)ในเทิร์นนี้ พลัง+5000' },
            { name: 'Blue Deathster, "Heavenly Death Ray" Stelvane', grade: 2, power: 10000, shield: 5000, skill: '[AUTO]: เมื่อถูกไรด์ทับโดย "Skyrender" Avantgarda ค้นหา Strategy 1 ใบจากในกองขึ้นมือ\n[AUTO](RC): เมื่อโจมตี ถ้ามี Strategy Card ถูกเข้าโซล(ใช้งาน)ในเทิร์นนี้ พลัง+5000' },
            { name: 'Blue Deathster, "Skyrender" Avantgarda', grade: 3, power: 13000, persona: true, skill: '[ACT](VC)[1/Turn]: หากในโซลมี "Blue Deathster, Sora Period" [เลือก Strategy 1 ใบจาก Order Zone เข้าโซล] จั่วการ์ด 1 ใบ แวนการ์ดพลัง+5000 และได้รับความสามารถ\n"[AUTO](VC)[1/Turn]: เมื่อจบการโจมตี หากโจมตีฮิตแวนการ์ด หรือทำ Persona Ride [CB1 & ทิ้งมือ 1 ใบ] Stand และไดรฟ์-1"' }
        ],
        mainDeck: [
            ...Array(4).fill({ name: 'Blue Deathster, "Skyrendriver" Avantgarda Richter', grade: 3, power: 13000, persona: true, skill: '[ACT](Hand): หากแวนคู่แข่งเกรด 3+ [เผยการ์ดนี้ & ไบนด์ "Skyrender" Avantgarda จาก (VC)] ไรด์ Stand และได้รับ [ACT] ของใบที่ถูกไบนด์\n[AUTO](VC): จบการบุก หากโซลมี "Sora Period" [ทิ้งมือ 2 ใบ] ไรด์ "Skyrender" Avantgarda จากไบนด์แบบ Stand, พลัง+10000 และ ไดรฟ์-1' }),
            ...Array(3).fill({ name: 'Blue Deathster, "Skyrender" Avantgarda', grade: 3, power: 13000, persona: true, skill: '[ACT](VC)[1/Turn]: หากในโซลมี "Blue Deathster, Sora Period" [เลือก Strategy 1 ใบจาก Order Zone เข้าโซล] จั่วการ์ด 1 ใบ แวนการ์ดพลัง+5000 และได้รับความสามารถ\n"[AUTO](VC)[1/Turn]: เมื่อจบการโจมตี หากโจมตีฮิตแวนการ์ด หรือทำ Persona Ride [CB1 & ทิ้งมือ 1 ใบ] Stand และไดรฟ์-1"' }),
            ...Array(3).fill({ name: 'Shock Strategy: Death Winds', grade: 3, power: 0, shield: 0, skill: '[Set Order] (Strategy)\n[AUTO]: เมื่อถูกนำเข้าโซลจาก Order Zone หากแวนการ์ดคู่แข่งระดับ 3 หรือสูงกว่า เลือกแวนการ์ด 1 ใบ "เมื่อโจมตี พลังแถวหน้าทั้งหมด +5000 จนจบเทิร์น"' }),
            ...Array(4).fill({ name: 'Ala Dargente', grade: 2, power: 10000, shield: 5000, skill: '[AUTO](RC): เมื่อแวนการ์ด "Avantgarda" ของคุณโจมตี ยูนิทนี้ได้รับ พลัง+5000 จนจบเทิร์น\n[AUTO]: เมื่อวางบน (RC) [SB1] ค้นหา Strategy Card ที่ชื่อไม่ซ้ำกับที่เพิ่งใส่โซลจากกองหรือดรอปนำขึ้นมือ 1 ใบ' }),
            ...Array(3).fill({ name: 'Sickle Blade of Inquest, Habitable Zone', grade: 2, power: 10000, shield: 5000, skill: '[AUTO]: เมื่อถูกทิ้งจากมือลงช่องดรอปใน Ride Phase [SB1 & นำการ์ดใบนี้เข้าใต้กอง] จั่วการ์ด 1 ใบ' }),
            ...Array(1).fill({ name: 'Bomber Strategy: Dusting', grade: 2, power: 0, shield: 0, skill: '[Set Order] (Strategy)\n(เข้าโซลเมื่อประกาศใช้งานจากแวนการ์ด)\n[AUTO]: เมื่อถูกส่งเข้าโซลจาก Order Zone แวนการ์ดคุณได้รับพลัง+10000 จนจบเทิร์น และคู่แข่งไม่สามารถอินเตอร์เซปต์หรือเล่น Blitz Order ได้' }),
            ...Array(4).fill({ name: 'Automated Belstul (Perfect Guard)', grade: 1, power: 8000, shield: 0, isPG: true, skill: '[Sentinel] (Perfect Guard)\n[AUTO]: เมื่อยูนิทนี้เข้าสู่ G เลือกยูนิทคุณ 1 ใบ ยูนิทนั้นไม่ถูกฮิตจนจบการต่อสู้ ถ้าคุณมีการ์ดในมือตั้งแต่ 2 ใบขึ้นไป ทิ้งการ์ด 1 ใบ' }),
            ...Array(3).fill({ name: 'Blue Deathster, Asagi Milestone', grade: 1, power: 8000, shield: 5000, skill: '[AUTO]: เมื่อวางบน (RC) หากแวนการ์ดมีชื่อ "Blue Deathster" หรือ "Avantgarda" [CB1] เลือกการ์ด "Avantgarda" เกรด 3 หรือสูงกว่าจากช่องดรอป 1 ใบขึ้นมือ\n[CONT](RC): หาก Strategy Card ถูกใส่เข้าโซลในเทิร์นนี้ ยูนิทนี้ได้รับพลัง+5000' }),
            ...Array(4).fill({ name: 'Blue Deathster, Hanada Halfway', grade: 1, power: 8000, shield: 5000, skill: '[AUTO]: เมื่อวางบน (RC) หากแวนการ์ดมีชื่อ "Blue Deathster" หรือ "Avantgarda" [CB1] จั่วการ์ด 1 ใบ\n[AUTO](RC): เมื่อบูสต์ ถ้าวาง Strategy ลง Order Zone ในเทิร์นนี้ พลัง+2000(จนจบแบตเทิล) และถ้าอยู่ช่องหลังสุดแถวกลาง ได้รับ [CC1]' }),
            ...Array(1).fill({ name: 'Disruption Strategy: Killshroud', grade: 1, power: 0, shield: 0, skill: '[Set Order] (Strategy)\n[AUTO]: เมื่อถูกนำเข้าโซลจาก Order Zone เลือกเรียร์การ์ดคู่แข่ง 1 ใบรีไทร์ และแวนการ์ดพลัง+5000 จนจบเทิร์น' }),
            ...Array(8).fill({ name: 'Critical Trigger (Brandt Gate)', grade: 0, power: 5000, shield: 15000, trigger: 'Critical' }),
            ...Array(3).fill({ name: 'Draw Trigger (Brandt Gate)', grade: 0, power: 5000, shield: 5000, trigger: 'Draw' }),
            ...Array(4).fill({ name: 'Heal Trigger (Brandt Gate)', grade: 0, power: 5000, shield: 15000, trigger: 'Heal' }),
            { name: 'Star Dragon Deity of Infinitude, Eldobreath', grade: 0, power: 5000, shield: 50000, trigger: 'Over', overPower: '100 Million' }
        ].sort(() => 0.5 - Math.random())
    };


    let currentDeck = bruceDeck;

    const youthberkDeck = {
        rideDeck: [
            { name: 'Youth Following in Footsteps, Youth', grade: 0, power: 6000, shield: 10000, skill: '[AUTO]: When this unit is rode upon, if you went second, draw a card.' },
            { name: 'Determined to Break Away, Youth', grade: 1, power: 8000, shield: 5000, skill: '[CONT](VC/RC): During the battle this unit attacked, this unit gets [Power] +2000.\n[AUTO]: When this unit is rode upon by "Knight of Ardent Light, Youth", [COST][Soul-Blast 1], look at the top three cards of your deck, choose up to one card with "Youthberk" in its card name from among them and reveal it and put it into hand, or choose up to one grade 2 or less unit card from among them and call it to (RC), and put the rest on the bottom of the deck in any order.' },
            { name: 'Knight of Ardent Light, Youth', grade: 2, power: 10000, shield: 5000, skill: '[AUTO]: When this unit is rode upon by a unit with the [RevolDress] ability, [COST][Counter-Blast 1], choose a grade 2 or greater card from your drop, and put it into hand.' },
            { name: 'Youthberk "Skyfall Arms"', grade: 3, power: 13000, persona: true, skill: '[RevolDress]－[AUTO](VC): At the end of the battle this unit attacked, choose up to one card with "RevolForm" in its card name from your hand, ride it as [Stand], and it gets drive -2 until end of turn.\n[ACT](VC)[1/turn]: [COST][Discard a card from hand], look at the top three cards of your deck, choose up to one card with "RevolForm" in its card name from among them and reveal it and put it into your hand, or choose up to one grade 2 or less card from among them and call it to (RC), and put the rest on the bottom of your deck in any order.' }
        ],
        mainDeck: [
            ...Array(3).fill({ name: 'Youthberk "Skyfall Arms"', grade: 3, power: 13000, persona: true, skill: '[RevolDress]－[AUTO](VC): At the end of the battle this unit attacked, choose up to one card with "RevolForm" in its card name from your hand, ride it as [Stand], and it gets drive -2 until end of turn.\n[ACT](VC)[1/turn]: [COST][Discard a card from hand], look at the top three cards of your deck, choose up to one card with "RevolForm" in its card name from among them and reveal it and put it into your hand, or choose up to one grade 2 or less card from among them and call it to (RC), and put the rest on the bottom of your deck in any order.' }),
            ...Array(4).fill({ name: 'Youthberk "RevolForm: Tempest"', grade: 3, power: 13000, persona: true, skill: 'RevolDress\n[AUTO](VC): เมื่อวางบน (VC) โดย [RevolDress], แถวหน้าทั้งหมดของคุณได้รับพลัง +5000 จนจบเทิร์น จากนั้น [CB1] เปิดการ์ด 2 ใบจากบนสุดของกอง เลือกเรียร์การ์ดคู่แข่ง 1 ใบที่เกรดตรงกับ 1 ในนั้น นำกลับเข้าใต้กอง, และนำการ์ดที่เปิดทั้งหมดขึ้นมือ\n[AUTO](VC): เมื่อจบเทิร์นของคุณ เลือกการ์ดที่มีความสามารถ [RevolDress] จากโซลแล้วไรด์ในสภาพ [Rest]' }),
            ...Array(3).fill({ name: 'Youthberk "RevolForm: Gust"', grade: 3, power: 13000, persona: true, skill: 'RevolDress\n[AUTO]: เมื่อวางบน (VC) โดยความสามารถ [RevolDress] หากแวนการ์ดคู่แข่งเป็นเกรด 3 หรือสูงกว่า [COST][ทิ้งมือ 1 ใบ] ยูนิทนี้ได้รับ [Power]+10000 และ [Drive]+1 จนจบเทิร์น\n[AUTO](VC): เมื่อจบเทิร์นของคุณ เลือกการ์ดที่มีความสามารถ [RevolDress] จากโซลแล้วไรด์ในสภาพ [Rest]' }),
            ...Array(3).fill({ name: 'Knight of Fracture, Schneizal', grade: 2, power: 10000, shield: 5000, skill: '[AUTO]: เมื่อวางบน (RC) [COST][CB1] ดู 5 ใบจากบนสุดของกอง เลือก G3 ที่มีชื่อ "Youthberk" 1 ใบขึ้นมือ สับกอง ยูนิทนี้พลัง +5000 จนจบเทิร์น\n[AUTO](RC): เมื่อยูนิทนี้โจมตีแวนการ์ด หากแวนการ์ดของคุณถูกวางเทิร์นนี้โดยไรด์จาก G3 เลือกแวนการ์ด 1 ใบ พลัง +5000 จนจบเทิร์น' }),
            ...Array(1).fill({ name: 'Galaxy Central Prison, Galactolus', grade: 1, type: 'Set Order', skill: '[Set Order] Prison: [COST][[Rest] 1 unit] to play!\n[AUTO]: When played, [SC3].\n[CONT]: คู่แข่งสามารถดึงการ์ดออกจากคุกใน Main Phase: [SB1] เรียก 1 ใบ หรือ [CB1] เรียก 2 ใบ' }),
            ...Array(3).fill({ name: 'Knight of Plowing, Dolbraig', grade: 2, power: 10000, shield: 5000, skill: '[AUTO](แถวหน้า RC): เมื่อแวนการ์ดถูกวางโดย [RevolDress] เลือกแวนการ์ด 1 ใบ พลัง +5000 จนจบเทิร์น\n[AUTO](RC): เมื่อยูนิทนี้โจมตียูนิท G3 หรือสูงกว่า [COST][SB1 การ์ดที่มี RevolForm ในชื่อ] ยูนิทนี้พลัง +10000 จนจบแบทเทิล' }),
            ...Array(2).fill({ name: 'Knight of Rendering Flash, Cairbre', grade: 2, power: 10000, shield: 5000, skill: '[AUTO]: เมื่อวางบน (RC) [COST][CB1 & SB1] ดู 3 ใบจากบนสุดของกอง เลือก 1 ใบ หากเป็นยูนิท G2 หรือต่ำกว่า คอลลง (RC) หากไม่ใช่ นำขึ้นมือ สับกอง' }),
            ...Array(4).fill({ name: 'Witch of Accumulation, Sequana', grade: 1, power: 8000, shield: 5000, skill: '[CONT](RC): เทิร์นเรา หากแวนการ์ดมีชื่อ "Youthberk" ยูนิทนี้พลัง +2000\n[AUTO](RC): เมื่อยูนิทถูกวางบน (VC) โดย [RevolDress] [COST][นำยูนิทนี้เข้าโซล] เลือกแวนการ์ด 1 ใบ ปรับ Drive เป็น 1 จนจบเทิร์น' }),
            ...Array(4).fill({ name: 'Wayward Therapy Angel', grade: 1, power: 10000, shield: 5000, skill: '[CONT]: การ์ดใบนี้ไม่สามารถถูกไรด์หรือคอลปกติจากมือ\n[AUTO]: เมื่อการ์ดใบนี้ถูกทิ้งจากมือในเทิร์นของคุณ หากแวนการ์ด G3+ [COST][SB1] คอลการ์ดใบนี้ลงแถวหลัง (RC)' }),
            ...Array(4).fill({ name: 'Palladium Zeal Dragon (PG)', grade: 1, power: 8000, shield: 0, isPG: true, skill: '[Sentinel] (Perfect Guard)\n[AUTO]: เมื่อยูนิทนี้เข้าสู่ G เลือกยูนิทคุณ 1 ใบ ยูนิทนั้นไม่ถูกฮิตจนจบการต่อสู้ ถ้าคุณมีการ์ดในมือตั้งแต่ 2 ใบขึ้นไป ทิ้งการ์ด 1 ใบ' }),

            ...Array(8).fill({ name: 'Critical Trigger (Keter)', grade: 0, power: 5000, shield: 15000, trigger: 'Critical' }),
            ...Array(3).fill({ name: 'Front Trigger (Keter)', grade: 0, power: 5000, shield: 15000, trigger: 'Front' }),
            ...Array(4).fill({ name: 'Heal Trigger (Keter)', grade: 0, power: 5000, shield: 15000, trigger: 'Heal' }),
            { name: 'Light Dragon Deity of Honors, Amartinoa', grade: 0, power: 5000, shield: 50000, trigger: 'Over', overPower: '100 Million' }
        ].sort(() => 0.5 - Math.random())
    };

    const overlordDeck = {
        rideDeck: [
            { name: 'Lizard Runner, Undeux', grade: 0, power: 6000, shield: 5000, skill: '[AUTO]: เมื่อยูนิทนี้ถูกไรด์ทับ หากคุณเริ่มทีหลัง จั่วการ์ด 1 ใบ' },
            { name: 'Embodiment of Armor, Bahr', grade: 1, power: 8000, shield: 5000, skill: '[AUTO]: เมื่อถูกไรด์ทับโดย "Dragon Knight, Nehalem", [COST][Counter-Blast 1], ค้นหาการ์ดเกรด 1 จากกองการ์ด 1 ใบ นำขึ้นมือ และสับกอง\n[AUTO](RC)[1/turn]: เมื่อแวนการ์ดของคุณโจมตีฮิต, ยูนิทนี้ได้รับ [Power] +5000 จนจบเทิร์น' },
            { name: 'Dragon Knight, Nehalem', grade: 2, power: 10000, shield: 5000, skill: '[AUTO]: เมื่อถูกไรด์ทับโดยยูนิทที่ติดชื่อ "Overlord", คอลการ์ดนี้ลงช่อง (RC).\n[ACT](RC)[1/turn]: ถ้าแวนการ์ดของคุณติดชื่อ "Overlord", [COST][Soul-Blast 1], ยูนิทนี้และแวนการ์ดทั้งหมดของคุณจะได้รับ [Power] +5000 จนจบเทิร์น' },
            { name: 'Dragonic Overlord the End', grade: 3, power: 13000, persona: true, skill: '[CONT](VC): ในเทิร์นของคุณ ถ้าในโซลมีการ์ดชื่อ "Dragonic Overlord" ไดร์ฟของยูนิทนี้จะไม่สามารถลดลงได้ด้วยผลของการ์ด และได้รับ [Power] +5000\n[AUTO](VC)[1/turn]: เมื่อจบการต่อสู้ที่ยูนิทนี้โจมตี, [COST][Counter-Blast 1 & ทิ้งการ์ด 2 ใบจากมือ], [Stand] ยูนิทนี้ และไดร์ฟ -1 จนจบเทิร์น' }
        ],
        mainDeck: [
            ...Array(3).fill({ name: 'Dragonic Overlord the End', grade: 3, power: 13000, persona: true, skill: '[CONT](VC): ในเทิร์นของคุณ ถ้าในโซลมีการ์ดชื่อ "Dragonic Overlord" ไดร์ฟของยูนิทนี้จะไม่สามารถลดลงได้ด้วยผลของการ์ด และได้รับ [Power] +5000\n[AUTO](VC)[1/turn]: เมื่อจบการต่อสู้ที่ยูนิทนี้โจมตี, [COST][Counter-Blast 1 & ทิ้งการ์ด 2 ใบจากมือ], [Stand] ยูนิทนี้ และไดร์ฟ -1 จนจบเทิร์น' }),
            ...Array(3).fill({ name: 'Dragonic Overlord', grade: 3, power: 13000, persona: true, skill: '[CONT](VC/RC): ในระหว่างแบทเทิลที่ยูนิทนี้โจมตีเรียร์การ์ด คู่แข่งไม่สามารถคอลการ์ดจากมือลง (GC) ได้\n[AUTO](VC)[1/turn]: เมื่อยูนิทนี้โจมตีฮิต, [COST][Counter-Blast 1 & ทิ้งการ์ด 1 ใบจากมือ], [Stand] ยูนิทนี้ และไดร์ฟ -1 จนจบเทิร์น' }),
            { name: 'Gratias Gradale', grade: 3, type: 'Normal Order', skill: 'Regalis Piece (ใส่ในกองได้ 1 ใบ ใช้งานได้ 1 ครั้งต่อ 1 ไฟท์)\n[Normal Order] ใช้งานต่อเมื่อแวนการ์ดของคุณคือเกรด 3 ที่มี Persona Ride และคุณยังไม่ได้ไรด์ในเทิร์นนี้!\nทำงาน Persona Ride (จั่วการ์ด 1 ใบ, ยูนิทแถวหน้าทั้งหมด [Power] +10000 ในเทิร์นนี้ และถือว่าคุณได้ทำ Persona Ride แล้ว)' },
            ...Array(2).fill({ name: 'Dragon Knight, Nehalem', grade: 2, power: 10000, shield: 5000, skill: '[AUTO]: เมื่อถูกไรด์ทับโดยยูนิทที่ติดชื่อ "Overlord", คอลการ์ดนี้ลงช่อง (RC).\n[ACT](RC)[1/turn]: ถ้าแวนการ์ดของคุณติดชื่อ "Overlord", [COST][Soul-Blast 1], ยูนิทนี้และแวนการ์ดทั้งหมดของคุณจะได้รับ [Power] +5000 จนจบเทิร์น' }),
            ...Array(3).fill({ name: 'Blast Artillery Dragon, Brachioforce', grade: 2, power: 10000, shield: 5000, skill: '[AUTO](RC): เมื่อยูนิทนี้โจมตีฮิต, [COST][รีไทร์ยูนิทนี้], จั่วการ์ด 1 ใบ, เลือกเรียร์การ์ดคู่แข่ง 1 ใบ และรีไทร์มัน' }),
            ...Array(4).fill({ name: 'Burning Horn Dragon', grade: 2, power: 10000, shield: 5000, skill: '[AUTO]: เมื่อวางลงบน (RC), [COST][Counter-Blast 1], ดูการ์ด 7 ใบจากบนสุดของกอง เลือกการ์ดที่ติดชื่อ "Overlord" ไม่เกิน 1 ใบนำขึ้นมือ จากนั้นสับกอง หากไม่ได้นำขึ้นมือ, [Counter-Charge 1].\n[AUTO](RC): เมื่อแวนการ์ดที่ติดชื่อ "Overlord" ของคุณโจมตี, ยูนิทนี้ได้รับ [Power] +5000 จนจบเทิร์น' }),
            ...Array(4).fill({ name: 'Ardor Hatchet Dragon', grade: 2, power: 10000, shield: 5000, skill: '[CONT](GC): ถ้าในโซลของคุณมีการ์ดที่ติดชื่อ "Overlord" ยูนิทนี้ได้รับ [Shield] +5000\n[ACT](RC): ถ้าแวนการ์ดคู่แข่งเกรด 3 หรือสูงกว่า, [COST][รีไทร์ยูนิทนี้], เลือกการ์ดเกรด 3 ที่ติดชื่อ "Overlord" จากดรอปโซน 1 ใบ นำเข้าสู่โซล' }),
            ...Array(4).fill({ name: 'Dragritter, Halbe', grade: 1, power: 8000, shield: 5000, skill: '[CONT]: เมื่อการ์ดใบนี้ถูกทิ้งจากมือเพื่อจ่ายคอสต์ของแวนการ์ดที่ติดชื่อ "Overlord" การทิ้งนี้สามารถนับเป็นการทิ้ง 2 ใบได้\n[AUTO]: เมื่อถูกทิ้งจากมือเพื่อจ่ายคอสต์ของแวนการ์ดที่ติดชื่อ "Overlord" คุณสามารถคอลการ์ดนี้ลงช่อง (RC) แถวหลังได้ หากคอลลงมา ยูนิทนี้ได้รับ [Power] +5000 จนจบเทิร์น' }),
            ...Array(2).fill({ name: 'Dragon Monk, Gojo', grade: 1, power: 8000, shield: 5000, skill: '[AUTO](RC): เมื่อแวนการ์ดที่ยูนิทนี้บูสต์โจมตีฮิต, [COST][รีไทร์ยูนิทนี้], ทำการ [Counter-Charge 1]' }),
            ...Array(4).fill({ name: 'Sparkle Rejector Dragon (PG)', grade: 1, power: 6000, shield: 0, isPG: true, skill: '[Sentinel] (Perfect Guard)\n[AUTO]: เมื่อยูนิทนี้เข้าสู่ (GC) เลือกยูนิทคุณ 1 ใบ ยูนิทนั้นจะไม่ถูกฮิตจนจบการต่อสู้ หากในมือของคุณมีตั้งแต่ 2 ใบขึ้นไป ให้ทิ้งการ์ด 1 ใบ' }),
            ...Array(8).fill({ name: 'Dragon Empire Critical Trigger', grade: 0, power: 5000, shield: 15000, trigger: 'Critical' }),
            ...Array(3).fill({ name: 'Dragon Empire Draw Trigger', grade: 0, power: 5000, shield: 5000, trigger: 'Draw' }),
            ...Array(4).fill({ name: 'Dragon Empire Heal Trigger', grade: 0, power: 5000, shield: 15000, trigger: 'Heal' }),
            { name: 'Dragveda', grade: 0, power: 5000, shield: 50000, trigger: 'Over', overPower: '100 Million' }
        ].sort(() => 0.5 - Math.random())
    };

    const greedonDeck = {
        rideDeck: [
            { name: 'Desire Devil, Taida', grade: 0, power: 6000, shield: 10000, skill: '[AUTO]: เมื่อถูกไรด์ทับ ถ้าคุณเริ่มเป็นคนที่สอง จั่วการ์ด 1 ใบ' },
            { name: 'Desire Devil, Gouman', grade: 1, power: 8000, shield: 5000, skill: '[AUTO]: When rode upon by "Desire Devil, Boshokku", [COST][reveal an "Avaricious Demonic Dragon, Greedon" from your ride deck], and draw a card.\n[AUTO]: เมื่อยูนิทนี้ถูกนำเข้าสู่โซลโดยความสามารถแวนการ์ดของคุณ หากแวนการ์ดคู่แข่งเกรด 3+, [COST][CB1], จนจบเทิร์น เมื่อคู่แข่งจะคอลการ์ดจากมือลง (GC) ต้องคอล 2 ใบขึ้นไปพร้อมกัน' },
            { name: 'Desire Devil, Boshokku', grade: 2, power: 10000, shield: 5000, skill: '[AUTO]: When rode upon by "Avaricious Demonic Dragon, Greedon", [COST][put a card from your hand into your soul], search your deck for a card with the same card name, reveal it and put it into your hand, and shuffle.\n[CONT](Soul): ในเทิร์นของคุณ หากคุณมีดาเมจ 4 ใบขึ้นไป "Avaricious Demonic Dragon, Greedon" บน (VC) พลัง +5000' },
            { name: 'Avaricious Demonic Dragon, Greedon', grade: 3, power: 13000, persona: true, skill: '[CONT](VC): หากในโซลมี "Avaricious Demonic Dragon, Greedon", Damage Limit ของคุณจะเป็น 7\n[AUTO](VC): เมื่อจบการต่อสู้ที่ยูนิทนี้โจมตี [COST][SB2 & นำเรียร์การ์ด 4 ใบที่แผ่นอยู่เข้าโซล] Stand ยูนิทนี้ หากในโซลมี 10 ใบขึ้นไป พลัง +15000 จนจบเทิร์น' }
        ],
        mainDeck: [
            ...Array(4).fill({ name: 'Avaricious Demonic Dragon King, Greedon Masques', grade: 3, power: 13000, persona: true, skill: '[CONT]: ยูนิทนี้จะไรด์ได้เฉพาะจากเกรด 3 ที่มี Greedon ในชื่อ\n[CONT](VC): Damage Limit ของคุณจะเป็น 7\n[ACT](VC)[1/Turn]: [COST][นำการ์ดที่มี Greedon ในชื่อที่ต่างจากยูนิทนี้จากมือ/โซล/ดรอป ออกนอกเกม] ดู 7 ใบ เลือก Desire Devil 1 ใบขึ้นมือ\n[AUTO](VC)[1/Turn]: เมื่อจบการต่อสู้ที่ยูนิทนี้โจมตี หากในโซลมี Desire Devil 3 ใบขึ้นไป [COST][นำเรียร์การ์ด 3 ใบที่สแตนด์อยู่เข้าโซล] Stand ยูนิทนี้ พลัง +5000' }),
            ...Array(2).fill({ name: 'Masque of Hydragrum', grade: 3, power: 0, type: 'Normal Order', skill: '[Normal Order]\n[ACT]: ดู 5 ใบ เลือกการ์ดที่มี Dragontree หรือ Masques 1 ใบขึ้นมือ จากนั้นสับกอง\n[ACT](Drop): หากแวนการ์ดเกรด 3 และไม่มี Masques ในชื่อ [COST][Reveal เกรด 3 Masques จากบนมือ] ไรด์การ์ดที่ Reveal ในสถานะ [Stand] หากไรด์และคู่แข่งเกรด 3+ และยังไม่ได้ทำ Persona Ride ในเทิร์นนี้ ให้ทำ Persona Ride' }),
            ...Array(3).fill({ name: 'Desire Devil, Mousheen', grade: 3, power: 13000, persona: true, skill: '[AUTO](Soul): เมื่อแวนการ์ด "Greedon" ของคุณโจมตี หากเป็นการโจมตีครั้งที่ 2 ของเทิร์นนี้ และคุณไม่มีเรียร์การ์ดชื่อเดียวกับการ์ดใบนี้ คุณสามารถคอลการ์ดนี้ลง (RC) หากคอล จนจบเทิร์น ยูนิทนี้ไม่สามารถถูกนำเข้าโซลโดยความสามารถแวนการ์ด และได้รับพลัง +5000.' }),
            ...Array(2).fill({ name: 'Clean-sweep Dragon', grade: 2, power: 10000, shield: 5000, skill: '[ACT](RC)[1/turn]: หากคุณ Persona Ride ในเทิร์นนี้ [CB1] เลือก Rear-guard ตัวเองหรือคู่แข่งไม่เกิน 3 ใบ นำเข้าโซลผู้เล่นนั้น ยูนิทนี้ได้รับ [Power] +5000 ต่อ 1 ใบ จนจบเทิร์น' }),
            ...Array(3).fill({ name: 'Dragontree Wretch, Skull Chemdah', grade: 2, power: 10000, shield: 5000, skill: '[AUTO]: เมื่อวางบน (RC) [CB1 & SB1] เลือก (RC) ของคุณที่ไม่มี Dragontree marker วาง Dragontree marker บนช่องนั้น ค้นหา Masque of Hydragrum จากกอง 1 ใบนำขึ้นมือ สับกอง' }),
            ...Array(3).fill({ name: 'Desire Devil, Saasyou', grade: 2, power: 10000, shield: 5000, skill: '[CONT](Deck): หากแวนการ์ดคือ "Greedon" การ์ดใบนี้มีชื่อร่วมกันกับการ์ดทั้งหมดที่มี "Desire Devil" ในโซลของคุณ\n[CONT](RC)/(GC): หากโซลมี "Desire Devil" 3 ใบขึ้นไป ยูนิทนี้ได้รับ [Power] +5000/[Shield] +5000' }),
            ...Array(3).fill({ name: 'Desire Devil, Boshokku', grade: 2, power: 10000, shield: 5000, skill: '[CONT](Soul): ในเทิร์นของคุณ หากคุณมีดาเมจ 4 ใบขึ้นไป "Avaricious Demonic Dragon, Greedon" บน (VC) พลัง +5000' }),
            ...Array(4).fill({ name: 'Desire Devil, Fuujo', grade: 2, power: 10000, shield: 5000, skill: '[AUTO]: เมื่อยูนิทนี้ถูกนำจาก (RC) เข้าสู่โซลโดยความสามารถของแวนการ์ดที่มี "Greedon" ในชื่อการ์ด เลือกเรียร์การ์ดของคู่แข่ง 1 ใบ และคุณสามารถรีไทร์มันได้\n[AUTO](โซล): เมื่อแวนการ์ดที่มี "Greedon" ในชื่อการ์ดของคุณโจมตี [จ่ายคอส][ไบนด์การ์ดนี้] และจนจบการต่อสู้นั้น เมื่อคู่แข่งจะคอลการ์ดจากบนมือลง (GC) พวกเขาต้องคอล 2 ใบขึ้นไปพร้อมกัน' }),
            ...Array(2).fill({ name: 'Desire Devil, Xitto', grade: 1, power: 8000, shield: 5000, skill: '[AUTO]: เมื่อยูนิทนี้ถูกนำจาก (RC) เข้าสู่โซลโดยความสามารถของแวนการ์ดของคุณ เลือกการ์ด 1 ใบจากดรอปของคุณ และนำเข้าสู่โซล' }),
            ...Array(4).fill({ name: 'Recusal Hate Dragon (Perfect Guard)', grade: 1, power: 8000, shield: 0, isPG: true, skill: '[Sentinel] (Perfect Guard)' }),

            ...Array(8).fill({ name: 'Critical Trigger (Dark States)', grade: 0, power: 5000, shield: 15000, trigger: 'Critical' }),
            ...Array(3).fill({ name: 'Draw Trigger (Dark States)', grade: 0, power: 5000, shield: 5000, trigger: 'Draw' }),
            ...Array(4).fill({ name: 'Heal Trigger (Dark States)', grade: 0, power: 5000, shield: 15000, trigger: 'Heal' }),
            { name: 'Hades Dragon Deity, Gallmageveld', grade: 0, power: 5000, shield: 50000, trigger: 'Over', overPower: '100 Million' }
        ].sort(() => 0.5 - Math.random())
    };

    const seraphDeck = {
        rideDeck: [
            { name: 'Aurora Battle Princess, Ruby Red', grade: 0, power: 6000, shield: 10000, skill: '[AUTO]: เมื่อถูกไรด์ทับ ถ้าคุณเริ่มเป็นคนที่สอง จั่วการ์ด 1 ใบ' },
            { name: 'Aurora Battle Princess, Kyanite Blue', grade: 1, power: 8000, shield: 5000, skill: '[AUTO]: เมื่อวางลงบน (VC), ค้นหาการ์ด Prison (คุก) จากในกองการ์ดของคุณไม่เกิน 1 ใบ, เปิดเผยและนำขึ้นมือ จากนั้นสลับกองการ์ด' },
            { name: 'Aurora Battle Princess, Risatt Pink', grade: 2, power: 10000, shield: 5000, skill: '[AUTO]: เมื่อวางลงบน (VC), คู่แข่งเลือกการ์ดจากบนมือของตนเอง 1 ใบ และขังการ์ดนั้นเข้าในคุกของคุณ (นำไปวางในช่อง Order Zone ที่มีคุก)' },
            { name: 'Aurora Battle Princess, Seraph Snow', grade: 3, power: 13000, persona: true, skill: '[CONT](VC): ในเทิร์นของคุณ หากมีการ์ดคู่แข่งติดคุกตั้งแต่ 1 ใบขึ้นไป ยูนิทนี้พลัง +10000 และถ้าติดคุกตั้งแต่ 3 ใบขึ้นไป ยูนิทนี้ Drive+1\n[ACT](VC/RC)[1/turn]: [CB1] เลือกเรียร์การ์ดคู่แข่ง 2 ใบ และขังเข้าในคุกของคุณ' }
        ],
        mainDeck: [
            ...Array(3).fill({ name: 'Aurora Fierce Princess, Seraph Purelight', grade: 4, power: 13000, skill: '[AUTO]: เมื่อวางลงบน (VC) [CB1 & SB1 การ์ดชื่อ Seraph] คู่แข่งเลือกการ์ดจาก มือ 2 ใบ, เรียร์การ์ด 2 ใบ และโซล 2 ใบ เพื่อขังเข้าในคุกของคุณ (คอสต์ลดลงหากผ่าน Security Upgrader)' }),
            ...Array(4).fill({ name: 'Aurora Battle Princess, Penetrate Aquas', grade: 3, power: 13000, skill: '[AUTO](RC): เมื่อวางลง ดึงการ์ด 1 ใบจากดรอปคู่แข่งลงคุก\n[CONT](RC/GC): ติดคุก 2ใบ+ พลัง+5000/โหล่+10000 และเมื่อโจมตี คู่แข่งต้องนำการ์ดจากมือป้องกันทีละ 2 ใบขึ้นไป' }),
            ...Array(1).fill({ name: 'Aurora Battle Princess, Launcher Charleen', grade: 3, power: 13000, skill: '[CONT](RC): เมื่อโจมตี คู่แข่งห้ามลงนอร์มอลยูนิทจากมือ และห้ามใช้ Blitz Order\n[CONT](RC): ตีไม่ได้ถ้าคู่แข่งติดคุก 5 ใบหรือน้อยกว่า' }),
            ...Array(1).fill({ name: 'Aurora Battle Princess, Derii Violet', grade: 2, power: 10000, shield: 5000, skill: '[AUTO](GC): วางลง (GC) คู่แข่งติดคุก 1 ใบ+ [SB1] เลือกยูนิท 1 ใบ จะไม่ถูก Hit โดยแวนเกรด 2 หริอต่ำกว่าจนจบการต่อสู้' }),
            ...Array(3).fill({ name: 'Aurora Battle Princess, Accuse Makarite', grade: 2, power: 10000, shield: 5000, skill: '[AUTO]: เมื่อคอลลง (RC) จากมือ [SB1] ขังใบบนสุดกองคู่แข่ง หงายหน้า, ถ้านักโทษมี 2+ พลัง +5000 จนจบเทิร์น' }),
            ...Array(3).fill({ name: 'Aurora Battle Princess, Cuff Spring', grade: 2, power: 10000, shield: 5000, skill: '[AUTO]: เมื่อคอลลง (RC) สั่งให้คู่แข่งเลือกการ์ดในมือ 1 ใบลงคุก หากคู่แข่งขังสำเร็จ ให้จั่วการ์ด 1 ใบ' }),
            ...Array(1).fill({ name: 'Galaxy Central Prison, Galactolus', grade: 1, type: 'Set Order', skill: '[Set Order] คุก: [Rest ยูนิทของคุณ 1 ใบ] เพื่อใช้งาน!\n[AUTO]: เมื่อใช้งาน [SC3].\n[CONT]: คู่แข่งสามารถประกันตัวออกจากคุกได้โดย: จ่าย [SB1] เพื่อเรียก 1 ใบลง (RC) หรือ [CB1] เพื่อเรียก 2 ใบลง (RC).' }),
            ...Array(3).fill({ name: 'Security Upgrader', grade: 1, power: 8000, shield: 5000, 
                skill: '[ACT](RC): ถ้า Vanguard เกรด 3+ ติดชื่อ Seraph และเทิร์นนี้ไม่ได้ไรด์ [COST][Retire ใบนี้], ค้นหา Seraph เกรด 4 จาก (กอง/มือ/ดรอป) 1 ใบไรด์ทับแบบ Stand, คู่แข่งเลือกการ์ดจากดรอป 1 ใบเข้าคุก และคอสต์ [AUTO] ของแวนที่ไรด์จะลด CB1 จนจบเทิร์น' }),
            ...Array(1).fill({ name: 'Aurora Battle Princess, Grenade Marieda', grade: 1, power: 8000, shield: 5000, 
                skill: '[AUTO]: เมื่อวางลง (RC), เลือกการ์ดในคุก 1 ใบลงใต้กองคู่แข่ง, คู่แข่งเลือก G0 ในดรอป 1 ใบเข้าคุก, ใบนี้พลัง +5000 จนจบเทิร์น' }),
            ...Array(4).fill({ name: 'Perfect guard', grade: 1, power: 8000, shield: 0, isPG: true, skill: '[Sentinel] ยูนิทนี้ไม่ฮิต' }),
            ...Array(3).fill({ name: 'Blitz Staff, Muna', grade: 1, power: 8000, shield: 5000, 
                skill: '[CONT](RC): ถ้าคุกมี 3+ ใบ, ใบนี้ไม่เป็นเป้าหมายสกิลคู่แข่ง และพลัง +5000\n[AUTO](RC)[1/turn]: เมื่อยูนิทถูกเรียกออกจากคุกลง (RC) [COST][SB1] เพื่อจั่วการ์ด 1 ใบ' }),
            ...Array(3).fill({ name: 'Aurora Battle Princess, Lifle Royar', grade: 1, power: 8000, shield: 5000, 
                skill: '[CONT](RC): ในเทิร์นคุณ ถ้าคู่แข่งมี 2+ ใบในคุก, ใบนี้พลัง +5000\n[ACT](RC)[1/turn]: ถ้าเทิร์นนี้มีคนติดคุก [COST][CB1], เลือก RC คู่แข่ง 1 ใบเข้าคุก, ดู 5 ใบจากบนสุดกอง เรียก G <= แวน 1 ใบลง (RC)' }),
            ...Array(5).fill({ name: 'Critical Trigger (Brandt Gate)', grade: 0, power: 5000, shield: 15000, trigger: 'Critical' }),
            ...Array(4).fill({ name: 'Front Trigger (Brandt Gate)', grade: 0, power: 5000, shield: 15000, trigger: 'Front' }),
            ...Array(2).fill({ name: 'Draw Trigger (Brandt Gate)', grade: 0, power: 5000, shield: 5000, trigger: 'Draw' }),
            ...Array(4).fill({ name: 'Heal Trigger (Brandt Gate)', grade: 0, power: 5000, shield: 15000, trigger: 'Heal' }),
            { name: 'Star Dragon Deity of Infinitude, Eldobreath', grade: 0, power: 5000, shield: 50000, trigger: 'Over', overPower: '100 Million' }
        ].sort(() => 0.5 - Math.random())
    };

    // --- Helper Functions ---
    function updateHandSpacing() {
        const cardsInHand = playerHand.querySelectorAll('.card');
        cardsInHand.forEach(c => {
            c.style.position = 'relative';
            c.style.transform = 'none';
        });
        updateHandCount();
    }

    function updateHandCount() {
        if (handCountNum) handCountNum.textContent = playerHand.querySelectorAll('.card').length;
    }

    function updateSoulUI() {
        if (soulPool.length > 0) {
            soulCounter.classList.remove('hidden');
            soulCounter.textContent = `Soul: ${soulPool.length}`;
        } else {
            soulCounter.classList.add('hidden');
        }
        syncCounts();
    }

    function syncCounts() {
        if (!conn) return;
        const myDamage = document.querySelectorAll('.my-side .damage-zone .card').length;
        const myDrop = document.querySelectorAll('.my-side .drop-zone .card').length;
        const myHand = playerHand.querySelectorAll('.card').length;
        const mySoul = soulPool.length;
        const myDeck = deckPool.length;

        const myOrder = document.querySelectorAll('.my-side .order-zone .card').length;

        // Update local quick view
        const qDrop = document.getElementById('quick-drop-num');
        const qDamage = document.getElementById('quick-damage-num');
        const qOrder = document.getElementById('quick-order-num');
        if (qDrop) qDrop.textContent = myDrop;
        if (qDamage) qDamage.textContent = myDamage;
        if (qOrder) qOrder.textContent = myOrder;

        sendData({
            type: 'syncCounts',
            damage: myDamage,
            drop: myDrop,
            hand: myHand,
            soul: mySoul,
            soulCards: soulPool.map(c => ({
                name: c.dataset.name,
                grade: c.dataset.grade,
                power: c.dataset.power,
                shield: c.dataset.shield,
                skill: c.dataset.skill
            })),
            order: myOrder,
            deck: myDeck
        });
    }

    function updateDropCount() {
        const count = document.querySelectorAll('.player-side.my-side .drop-zone .card').length;
        if (dropCountNum) dropCountNum.textContent = count;
        syncCounts();
    }

    function updateDamageCount() {
        const count = document.querySelectorAll('.player-side.my-side .damage-zone .card').length;
        if (damageCountNum) damageCountNum.textContent = count;
        syncCounts();
    }

    function updateGCShield() {
        const gc = document.querySelector('.guardian-circle');
        const display = document.getElementById('gc-shield-display');
        if (!gc || !display) return;

        let total = 0;
        const hasOverlordInSoul = soulPool.some(c => c.dataset.name && c.dataset.name.includes("Overlord"));

        gc.querySelectorAll('.card').forEach(c => {
            let s = parseInt(c.dataset.shield || "0");
            if (c.dataset.name && c.dataset.name.includes("Ardor Hatchet Dragon") && hasOverlordInSoul) {
                s += 5000;
            }
            total += s;
        });

        if (window.currentIncomingAttack && isGuarding) {
            const attPower = window.currentIncomingAttack.totalPower;
            const targetId = window.currentIncomingAttack.targetId;
            const targetCircle = document.querySelector(`.my-side .circle[data-zone="${targetId}"]`);
            const targetCard = targetCircle ? targetCircle.querySelector('.card:not(.dragging)') : null;
            const targetPower = targetCard ? parseInt(targetCard.dataset.power || "0") : 0;
            const needed = (attPower - targetPower) + 5000;

            if (total >= needed) {
                display.style.color = "#00ffcc";
                display.style.textShadow = "0 0 10px #00ffcc";
                display.innerHTML = `🛡️ SHIELD: ${total} <span style="font-size: 0.8rem; opacity: 0.8;">(CLEAR!)</span>`;
            } else {
                display.style.color = "#ff2a6d";
                display.style.textShadow = "0 0 10px #ff2a6d";
                display.innerHTML = `🛡️ SHIELD: ${total} <span style="font-size: 0.8rem; opacity: 0.8;">(Need: ${Math.max(0, needed - total)} more)</span>`;
            }
        } else {
            display.style.color = "var(--accent-vanguard)";
            display.style.textShadow = "none";
            display.textContent = `Shield: ${total}`;
        }
        
        updateBattleHubUI();
    }

    function updateBattleHubUI() {
        const hub = document.getElementById('battle-hub');
        if (!hub) return;

        if (window.currentIncomingAttack && isGuarding) {
            const attackData = window.currentIncomingAttack;
            const attackerPower = attackData.totalPower;
            const targetId = attackData.targetId;
            const targetCircle = document.querySelector(`.my-side .circle[data-zone="${targetId}"]`);
            const defenderCard = targetCircle ? targetCircle.querySelector('.card:not(.dragging)') : null;
            const targetPower = defenderCard ? parseInt(defenderCard.dataset.power || "0") : 0;
            
            // Attacker box should be Cyan, Defender box Magenta
            document.querySelectorAll('.hub-unit-box')[0].style.borderColor = "var(--accent-cyan)";
            document.querySelectorAll('.hub-unit-box')[0].style.boxShadow = "0 0 15px rgba(5, 217, 232, 0.2)";
            document.querySelectorAll('.hub-unit-box')[1].style.borderColor = "var(--accent-vanguard)";
            document.querySelectorAll('.hub-unit-box')[1].style.boxShadow = "0 0 15px rgba(255, 42, 109, 0.2)";
            
            // Current GC shield
            const gc = document.querySelector('.guardian-circle');
            let totalShield = 0;
            if (gc) {
                gc.querySelectorAll('.card').forEach(c => {
                    totalShield += parseInt(c.dataset.shield || "0");
                });
            }

            const defenderTotal = targetPower + totalShield;
            const isGuarded = defenderTotal > attackerPower;

            // Update UI elements
            document.getElementById('hub-attacker-name').textContent = attackData.attackerName;
            document.getElementById('hub-attacker-power').textContent = attackerPower.toLocaleString();
            
            // Add Critical and Drive display
            const hubAttackerCrit = document.getElementById('hub-attacker-crit');
            const hubAttackerDrive = document.getElementById('hub-attacker-drive');
            if (hubAttackerCrit) hubAttackerCrit.textContent = `★${attackData.totalCritical || 1}`;
            if (hubAttackerDrive) hubAttackerDrive.textContent = `Drive: ${attackData.driveCount || 0}`;
            document.getElementById('hub-defender-name').textContent = attackData.targetName;
            
            const defenderBaseDisp = document.getElementById('hub-defender-power');
            defenderBaseDisp.innerHTML = `${targetPower.toLocaleString()}<span style="font-size: 0.6rem; opacity: 0.5; display: block; font-family: Outfit;">(BASE)</span>`;
            
            const shieldBonus = document.getElementById('hub-shield-bonus');
            if (totalShield > 0) {
                shieldBonus.innerHTML = `+${totalShield.toLocaleString()}<span style="font-size: 0.6rem; opacity: 0.5; display: block; font-family: Outfit;">(SHIELD)</span>`;
                shieldBonus.classList.remove('hidden');
            } else {
                shieldBonus.classList.add('hidden');
            }

            // Progress bar logic
            const statusText = document.getElementById('hub-status-text');
            const progress = document.getElementById('hub-progress');
            
            // Ratio relative to attacker power. 100% means tie (still hitting).
            const ratio = Math.min(100, (defenderTotal / (attackerPower + 5000)) * 100);
            progress.style.width = `${ratio}%`;

            if (isGuarded) {
                hub.classList.add('guarded');
                statusText.textContent = `GUARDED (SUM: ${defenderTotal.toLocaleString()})`;
            } else {
                hub.classList.remove('guarded');
                statusText.textContent = `HITTING (SUM: ${defenderTotal.toLocaleString()})`;
            }

            hub.classList.add('active');
        } else {
            hub.classList.remove('active');
        }
    }

    function updateDeckCounter() {
        if (deckCountNum) deckCountNum.textContent = deckPool.length;

        const deckZones = document.querySelectorAll('.deck-zone');
        deckZones.forEach(zone => {
            const count = (zone.dataset.zone === 'deck' && zone.id === 'main-deck') ? deckPool.length : 40;
            const shadowSize = Math.ceil(count / 5);
            let shadowStr = "";
            for (let i = 1; i <= shadowSize; i++) {
                shadowStr += `0 ${i * 2}px 0 ${i % 2 === 0 ? '#111' : '#222'}${i === shadowSize ? '' : ','}`;
            }
            zone.style.boxShadow = shadowStr || 'none';
        });
        syncCounts();
    }

    function soulCharge(count = 1) {
        for (let i = 0; i < count; i++) {
            if (deckPool.length > 0) {
                const cardData = deckPool.pop();
                const card = createCardElement(cardData);
                soulPool.push(card);
            }
        }
        updateSoulUI();
        updateDeckCounter();
        const msg = `ทำการ Soul Charge ${count} ใบ!`;
        alert(msg);
        sendData({ type: 'announce', msg: `คู่แข่ง: ${msg}` });
    }

    function promptSoulCall(targetZoneName, onComplete, isOptional = true) {
        if (soulPool.length === 0) {
            alert("Soul is empty, skipping Call.");
            if (onComplete) onComplete();
            return;
        }

        viewerTitle.textContent = isOptional ? "Choose a card to Call (Optional)" : "Choose a card to Call (Mandatory)";
        viewerGrid.innerHTML = '';
        zoneViewer.classList.remove('hidden');

        // Only show "Skip" if the source effect is optional
        if (isOptional) {
            const skipCard = document.createElement('div');
            skipCard.className = 'card';
            skipCard.style.cursor = 'pointer';
            skipCard.style.display = 'flex';
            skipCard.style.flexDirection = 'column';
            skipCard.style.justifyContent = 'center';
            skipCard.style.alignItems = 'center';
            skipCard.style.background = 'rgba(255,255,255,0.05)';
            skipCard.style.border = '1px dashed #666';
            skipCard.innerHTML = `<div style="font-size: 0.8rem; text-align: center; color: #888;">SKIP<br>CALL</div>`;
            skipCard.onclick = () => {
                zoneViewer.classList.add('hidden');
                if (onComplete) onComplete();
            };
            viewerGrid.appendChild(skipCard);
        }

        soulPool.forEach((soulCard, index) => {
            const clone = soulCard.cloneNode(true);
            clone.classList.remove('dragging', 'rest', 'opponent-card');
            clone.style.position = 'relative';
            clone.style.cursor = 'pointer';

            clone.onclick = async () => {
                const targetCircle = document.querySelector(`.my-side .circle[data-zone="${targetZoneName}"]`);
                if (targetCircle) {
                    const actualCard = soulPool.splice(index, 1)[0];
                    const existing = targetCircle.querySelector('.card:not(.opponent-card)');
                    if (existing) {
                        const dropZone = document.querySelector('.my-side .drop-zone');
                        dropZone.appendChild(existing);
                        existing.classList.remove('rest');
                        sendMoveData(existing);
                    }
                    targetCircle.appendChild(actualCard);
                    actualCard.classList.remove('rest');
                    actualCard.style.transform = 'none';
                    sendMoveData(actualCard);
                    updateSoulUI();
                    updateDropCount();
                    await checkOnPlaceAbilities(actualCard);
                }
                zoneViewer.classList.add('hidden');
                if (onComplete) onComplete();
            };
            viewerGrid.appendChild(clone);
        });
    }

    async function promptRetireToSoulForDraw(onComplete) {
        const rearGuards = document.querySelectorAll('.my-side .circle.rc .card:not(.opponent-card)');
        if (rearGuards.length === 0) {
            alert("No Rear-guards to pay for Richard's ability!");
            if (onComplete) onComplete();
            return;
        }

        if (await vgConfirm("Use Richard's ability? Cost: Put 1 Rear-guard into Soul to draw 1 card.")) {
            alert("Select a Rear-guard to put into Soul.");
            document.body.classList.add('targeting-mode');

            const costListener = (e) => {
                const card = e.target.closest('.card');
                if (card && card.parentElement && card.parentElement.classList.contains('rc') && !card.classList.contains('opponent-card')) {
                    e.stopPropagation();
                    soulPool.push(card);
                    // Send move data to notify opponent card is entering soul
                    sendData({ type: 'moveCard', cardId: card.id, zone: 'soul', cardName: card.dataset.name });
                    card.remove();
                    updateSoulUI();
                    drawCard(true);
                    document.body.classList.remove('targeting-mode');
                    document.removeEventListener('click', costListener, true);
                    alert("Richard: Cost paid! Drew 1 card.");
                    sendData({ type: 'syncCounts', soul: soulPool.length, hand: playerHand.childElementCount });
                    if (onComplete) onComplete();
                }
            };
            document.addEventListener('click', costListener, true);
        } else {
            if (onComplete) onComplete();
        }
    }

    function resolveAbilityQueue(queue) {
        return new Promise(resolveAll => {
            if (!queue || queue.length === 0) {
                resolveAll();
                return;
            }

            if (queue.length === 1) {
                queue[0].resolve(() => {
                    resolveAll();
                });
                return;
            }

            viewerTitle.textContent = "Select ability resolution order";
            viewerGrid.innerHTML = '';
            zoneViewer.classList.remove('hidden');

            queue.forEach((ability, index) => {
                const tile = document.createElement('div');
                tile.className = 'card';
                tile.style.position = 'relative';
                tile.style.cursor = 'pointer';
                tile.style.display = 'flex';
                tile.style.flexDirection = 'column';
                tile.style.justifyContent = 'center';
                tile.style.alignItems = 'center';
                tile.style.textAlign = 'center';
                tile.style.padding = '10px';
                tile.style.background = 'rgba(255, 42, 109, 0.1)';
                tile.style.border = '2px solid var(--accent-vanguard)';

                tile.innerHTML = `
                <div style="font-weight:bold; color:white; margin-bottom:5px; font-size:0.9rem;">${ability.name}</div>
                <div style="font-size:0.65rem; color:#aaa;">${ability.description}</div>
            `;

                tile.onclick = () => {
                    zoneViewer.classList.add('hidden');
                    ability.resolve(() => {
                        const nextQueue = queue.filter((_, i) => i !== index);
                        // Using thenable or async recursion
                        resolveAbilityQueue(nextQueue).then(resolveAll);
                    });
                };
                viewerGrid.appendChild(tile);
            });
        });
    }

    async function checkRideAbilities(oldVanguard, newCard, discardedCard = null) {
        const queue = [];
        const oldName = oldVanguard ? (oldVanguard.dataset.name || "").toLowerCase() : "";
        const newName = (newCard.dataset.name || "").toLowerCase();

        // 0. Discarded Card Abilities (e.g. Habitable Zone)
        if (discardedCard) {
            const discName = (discardedCard.dataset.name || "").toLowerCase();
            if (discName.includes('habitable zone')) {
                queue.push({
                    name: 'Habitable Zone: [AUTO]',
                    description: "เมื่อถูกทิ้งเพื่อไรด์ [SB1 & นำการ์ดนี้เข้าใต้กอง] เพื่อจั่วการ์ด 1 ใบ",
                    resolve: async (done) => {
                        if (await vgConfirm("Habitable Zone: [SB1 & นำการ์ดนี้เข้าใต้กอง] เพื่อจั่วการ์ด 1 ใบ?")) {
                            if (await paySoulBlast(1)) {
                                const cardData = JSON.parse(discardedCard.dataset.cardData || "{}");
                                deckPool.unshift(cardData);
                                discardedCard.remove();
                                updateDeckCounter();
                                drawCard(1);
                                alert("Habitable Zone: นำเข้าใต้กองและจั่วการ์ด 1 ใบสำเร็จ!");
                                sendMoveData(discardedCard, 'deck');
                                updateAllStaticBonuses();
                            }
                        }
                        if (done) done();
                    }
                });
            }
        }

        // 1. Universal Grade 0 "Go Second" Skill
        // We check grade 0 of the OLD vanguard being ridden over.
        if (oldVanguard && (parseInt(oldVanguard.dataset.grade) === 0 || oldVanguard.dataset.name.toLowerCase().includes('starter') || oldVanguard.dataset.name.toLowerCase().includes('egg'))) {
            // Priority check for second player status
            if (isFirstPlayer === false || window.isFirstPlayer === false) {
                queue.push({
                    name: 'โบนัสคนเริ่มหลัง (Starter Bonus)',
                    description: "จั่วการ์ด 1 ใบเพราะได้เริ่มคนที่สอง",
                    resolve: (done) => {
                        console.log("Starter Bonus triggered for Player 2");
                        alert("Starter Bonus: คุณได้เริ่มเป็นคนที่สอง! จั่วการ์ด 1 ใบ");
                        drawCard(true);
                        if (done) done();
                    }
                });
            }
        }

        // 2. Overlord Ride Line Specifics
        if (oldName.includes('bahr') && newName.includes('nehalem')) {
            queue.push({
                name: 'Bahr (G1) Ride Skill',
                description: "เมื่อ Nehalem ไรด์ทับ [CB1] ค้นหาการ์ด G1 1 ใบจากกองการ์ดขึ้นมือ",
                resolve: async (done) => {
                    if (await vgConfirm("Bahr: [AUTO] เมื่อ Nehalem ไรด์ทับ จ่าย [CB1] เพื่อค้นหาการ์ดเกรด 1 สูงสุด 1 ใบจากกองขึ้นมือ?")) {
                        if (payCounterBlast(1)) {
                            const g1Cards = deckPool.filter(c => parseInt(c.grade) === 1);
                            if (g1Cards.length > 0) {
                                openViewer("ค้นหา G1 1 ใบขึ้นมือ", g1Cards);
                                await new Promise(resolve => {
                                    const pickHandler = (e) => {
                                        const clicked = e.target.closest('.card');
                                        if (clicked && clicked.parentElement === viewerGrid) {
                                            const selectedName = clicked.dataset.name;
                                            const idx = deckPool.findIndex(c => c.name === selectedName);
                                            if (idx !== -1) {
                                                const pickedData = deckPool.splice(idx, 1)[0];
                                                const newlyAdded = createCardElement(pickedData);
                                                playerHand.appendChild(newlyAdded);
                                                sendMoveData(newlyAdded);
                                                updateHandSpacing();
                                                alert(`นำ ${pickedData.name} ขึ้นมือแล้ว!`);
                                            }
                                            deckPool.sort(() => 0.5 - Math.random());
                                            updateDeckCounter();
                                            viewerGrid.removeEventListener('click', pickHandler);
                                            zoneViewer.classList.add('hidden');
                                            resolve();
                                        }
                                    };
                                    viewerGrid.addEventListener('click', pickHandler);
                                });
                            } else {
                                alert("ไม่พบการ์ดเกรด 1 ในกอง!");
                            }
                        }
                    }
                    if (done) done();
                }
            });
        }

        // --- Seraph Ride Line Specifics ---
        if (oldName.includes('ruby red') && newName.includes('kyanite blue')) {
            queue.push({
                name: 'Kyanite Blue Ride Skill',
                description: "เมื่อ Kyanite Blue ไรด์ทับ ค้นหา Prison จากกอง 1 ใบนำขึ้นมือ",
                resolve: async (done) => {
                    if (await vgConfirm("Kyanite Blue: ค้นหา Prison จากกองการ์ด 1 ใบเพื่อนำขึ้นมือ?")) {
                        const prisonCards = deckPool.filter(c => c.name.toLowerCase().includes('prison'));
                        if (prisonCards.length > 0) {
                            openViewer("ค้นหา Prison 1 ใบเพื่อนำขึ้นมือ", prisonCards);
                            await new Promise(resolve => {
                                const pickHandler = (e) => {
                                    const clicked = e.target.closest('.card');
                                    if (clicked && clicked.parentElement === viewerGrid) {
                                        const selectedName = clicked.dataset.name;
                                        const idx = deckPool.findIndex(c => c.name === selectedName);
                                        if (idx !== -1) {
                                            const pickedData = deckPool.splice(idx, 1)[0];
                                            const newlyAdded = createCardElement(pickedData);
                                            playerHand.appendChild(newlyAdded);
                                            sendMoveData(newlyAdded);
                                            updateHandSpacing();
                                            alert(`พบ Prison: ${pickedData.name}! นำขึ้นมือเรียบร้อยแล้ว!`);
                                        }
                                        deckPool.sort(() => 0.5 - Math.random());
                                        updateDeckCounter();
                                        viewerGrid.removeEventListener('click', pickHandler);
                                        zoneViewer.classList.add('hidden');
                                        resolve();
                                    }
                                };
                                viewerGrid.addEventListener('click', pickHandler);
                            });
                        } else {
                            alert("ไม่พบใบ Prison ในกองการ์ด!");
                        }
                    }
                    if (done) done();
                }
            });
        }

        if (oldName.includes('kyanite blue') && newName.includes('risatt pink')) {
            queue.push({
                name: 'Risatt Pink Ride Skill',
                description: "เมื่อ Risatt Pink ไรด์ทับ ให้คู่แข่งเลือกการ์ดในมือ 1 ใบนำไปขังในคุกของคุณ",
                resolve: async (done) => {
                    if (await vgConfirm("Risatt Pink: สั่งให้คู่แข่งเลือกการ์ดบนมือ 1 ใบเพื่อไปขังในคุก?")) {
                        sendData({ type: 'forceImprison', min: 1, max: 1, fromZone: 'hand' });
                        alert("แจ้งเตือนไปที่คู่แข่งให้เลือกการ์ดบนมือแล้ว รอให้คู่แข่งเลือก...");
                    }
                    if (done) done();
                }
            });
        }

        if (newName.includes('seraph purelight')) {
            queue.push({
                name: 'Seraph Purelight [AUTO]',
                description: "เมื่อวางบน (VC) [CB1 & SB1 ถอด Seraph] ให้คู่แข่งเลือกมือ 2 / เรียร์ 2 / โซล 2 ไปขังในคุก! (คอสต์ลดลงถ้ามีผลของ Security Upgrader)",
                resolve: async (done) => {
                    const reduced = window.seraphCostReduction === true;
                    // Check SB requirement first before paying CB
                    const validSB = soulPool.filter(sc => (sc.dataset.name || "").toLowerCase().includes('seraph'));
                    
                    if (validSB.length === 0) {
                        alert("คุณไม่มีโซลที่ชื่อ Seraph สำหรับจ่ายคอสต์ SB (สกิลไม่ทำงาน)");
                        if (done) done();
                        return;
                    }

                    if (await vgConfirm(`Seraph Purelight: [${reduced ? '0' : 'CB1'} & SB1 การ์ดชื่อ Seraph] สั่งคู่แข่งขังการ์ด?`)) {
                        if (reduced || payCounterBlast(1)) {
                            openViewer("เลือก Soul ที่ติดชื่อ Seraph 1 ใบเพื่อจ่ายคอสต์ SB", validSB.map(sc => ({
                                name: sc.dataset.name,
                                grade: sc.dataset.grade,
                                id: sc.id
                            })));

                            let costPaid = false;
                            await new Promise(resolveSB => {
                                const sbHandler = (e) => {
                                    const clicked = e.target.closest('.card');
                                    if (clicked && clicked.parentElement === viewerGrid) {
                                        const selectedId = clicked.dataset.originalId || clicked.dataset.id;
                                        const idx = soulPool.findIndex(sc => sc.id === selectedId);
                                        if (idx !== -1) {
                                            const blasted = soulPool.splice(idx, 1)[0];
                                            const dropZone = document.querySelector('.my-side .drop-zone');
                                            dropZone.appendChild(blasted);
                                            sendMoveData(blasted, 'drop-zone');
                                            updateSoulUI();
                                            updateDropCount();
                                            costPaid = true;
                                            cleanup();
                                        }
                                    }
                                };
                                
                                const closeH = () => {
                                    cleanup();
                                };

                                const cleanup = () => {
                                    viewerGrid.removeEventListener('click', sbHandler);
                                    closeViewerBtn.removeEventListener('click', closeH);
                                    zoneViewer.classList.add('hidden');
                                    resolveSB();
                                };

                                viewerGrid.addEventListener('click', sbHandler);
                                closeViewerBtn.addEventListener('click', closeH);
                            });

                            if (costPaid) {
                                sendData({ type: 'forceImprisonMass', count: 2 });
                                alert("ส่งคำสั่งขังคุกมวลชนไปที่ฝั่งตรงข้ามแล้ว!");
                            } else {
                                // Refund CB if possible or just inform
                                alert("ยกเลิกการจ่าย SB สกิลไม่ทำงาน");
                            }
                        }
                    }
                    if (done) done();
                }
            });
        }

        if (oldName.includes('nehalem') && newName.includes('overlord')) {
            queue.push({
                name: 'Nehalem (G2) Ride Skill',
                description: "เมื่อแวนการ์ดที่ติดชื่อ 'Overlord' ไรด์ทับ คอลการ์ดนี้ลง (RC)",
                resolve: async (done) => {
                    if (await vgConfirm("Nehalem: [AUTO] เมื่อ Overlord ไรด์ทับ คอล Nehalem ใบนี้ลง (RC)?")) {
                        const nehalemIdx = soulPool.findIndex(c => c.dataset.name.toLowerCase().includes('nehalem'));
                        if (nehalemIdx !== -1) {
                            const nehalemCard = soulPool.splice(nehalemIdx, 1)[0];
                            alert("คลิกเลือกช่อง (RC) เพื่อคอล Nehalem");
                            document.body.classList.add('targeting-mode');
                            await new Promise(resolve => {
                                const rcHandler = (ev) => {
                                    const circle = ev.target.closest('.my-side .circle.rc');
                                    if (circle) {
                                        ev.stopPropagation();
                                        const existing = circle.querySelector('.card:not(.opponent-card)');
                                        if (existing) {
                                            const dropZone = document.querySelector('.my-side .drop-zone');
                                            dropZone.appendChild(existing);
                                            existing.classList.remove('rest');
                                            sendMoveData(existing);
                                        }
                                        circle.appendChild(nehalemCard);
                                        nehalemCard.classList.remove('rest');
                                        nehalemCard.style.transform = 'none';
                                        sendMoveData(nehalemCard);
                                        updateSoulUI();
                                        updateDropCount();
                                        alert("คอล Nehalem สำเร็จ!");
                                        document.body.classList.remove('targeting-mode');
                                        document.removeEventListener('click', rcHandler, true);
                                        resolve();
                                    }
                                };
                                document.addEventListener('click', rcHandler, true);
                            });
                        } else {
                            alert("ไม่พบ Nehalem ในโซล!");
                        }
                    }
                    if (done) done();
                }
            });
        }

        // --- Greedon Ride Line Specifics ---
        if (oldName.includes('gouman') && newName.includes('boshokku')) {
            queue.push({
                name: 'Gouman Ride Skill',
                description: "เมื่อ Boshokku ไรด์ทับ Reveal 'Avaricious Demonic Dragon, Greedon' จาก Ride Deck เพื่อจั่วการ์ด 1 ใบ",
                resolve: async (done) => {
                    const rideDeckCards = Array.from(document.querySelectorAll('#ride-deck .card'));
                    const greedonInRideDeck = rideDeckCards.some(c => (c.dataset.name || "").includes('Greedon'));
                    
                    if (greedonInRideDeck) {
                        if (await vgConfirm("Gouman: Reveal 'Greedon' จาก Ride Deck และจั่วการ์ด 1 ใบ?")) {
                            drawCard(true);
                        }
                    } else {
                        // Fallback
                        if (await vgConfirm("Gouman: จั่วการ์ด 1 ใบ? (ถูก Boshokku ไรด์ทับ)")) {
                            drawCard(true);
                        }
                    }
                    if (done) done();
                }
            });
        }

        if (oldName.includes('boshokku') && newName.includes('greedon')) {
            queue.push({
                name: 'Boshokku Ride Skill',
                description: "เมื่อ Greedon ไรด์ทับ [COST][นำการ์ดจากมือ 1 ใบเข้าโซล] ค้นหา Boshokku จากกองขึ้นมือ",
                resolve: async (done) => {
                    const cardsInHand = Array.from(playerHand.querySelectorAll('.card'));
                    if (cardsInHand.length > 0) {
                        if (await vgConfirm("Boshokku: นำการ์ดจากมือ 1 ใบเข้าโซล เพื่อค้นหา Boshokku จากกองขึ้นมือ?")) {
                            openViewer("เลือกการ์ดจากมือ 1 ใบเพื่อเข้าโซล", cardsInHand);
                            await new Promise(resolvePickHand => {
                                const handListener = (e) => {
                                    const card = e.target.closest('.card');
                                    if (card && card.parentElement === viewerGrid) {
                                        const selectedId = card.dataset.originalId || card.id;
                                        const actualCard = cardsInHand.find(c => c.id === selectedId);
                                        if (actualCard) {
                                            soulPool.push(actualCard);
                                            actualCard.remove();
                                            sendMoveData(actualCard, 'soul');
                                            updateSoulUI();

                                            // Search Deck for Boshokku
                                            const targets = deckPool.filter(c => c.name.toLowerCase().includes('boshokku'));
                                            if (targets.length > 0) {
                                                const searchEffect = async () => {
                                                    openViewer("ค้นหา Boshokku 1 ใบ", targets);
                                                    const deckListener = (ev) => {
                                                        const deckCard = ev.target.closest('.card');
                                                        if (deckCard && deckCard.parentElement === viewerGrid) {
                                                            const targetName = deckCard.dataset.name;
                                                            const idx = deckPool.findIndex(c => c.name === targetName);
                                                            if (idx !== -1) {
                                                                const found = deckPool.splice(idx, 1)[0];
                                                                const el = createCardElement(found);
                                                                playerHand.appendChild(el);
                                                                sendMoveData(el);
                                                                updateHandSpacing();
                                                                updateDeckCounter();
                                                                alert(`นำ ${found.name} ขึ้นมือแล้ว!`);
                                                            }
                                                            viewerGrid.removeEventListener('click', deckListener);
                                                            zoneViewer.classList.add('hidden');
                                                            resolvePickHand();
                                                        }
                                                    };
                                                    viewerGrid.addEventListener('click', deckListener);
                                                };
                                                searchEffect();
                                            } else {
                                                alert("ไม่พบ Boshokku ในกองการ์ด!");
                                                zoneViewer.classList.add('hidden');
                                                resolvePickHand();
                                            }
                                        }
                                        viewerGrid.removeEventListener('click', handListener);
                                    }
                                };
                                viewerGrid.addEventListener('click', handListener);
                            });
                        } else { resolvePickHand(); }
                    } else { alert("ไม่มีการ์ดในมือเพื่อจ่ายคอสต์!"); resolvePickHand(); }
                    if (done) done();
                }
            });
        }

        // 3. Bruce Ride Line Specifics (When Placed on VC)
        // G1 Steve
        if (newName.includes('steve')) {
            queue.push({
                name: 'ความสามารถของ Steve (G1)',
                description: "เลือกการ์ด 1 ใบจากโซลเพื่อคอลลงช่องแถวหลังตรงกลาง และทำการ Soul Charge 1",
                resolve: (done) => {
                    if (soulPool.length === 0) {
                        alert("ไม่มีการ์ดในโซล! ทำการ Soul Charge 1 เท่านั้น");
                        soulCharge(1);
                        if (done) done();
                        return;
                    }

                    viewerTitle.textContent = "เลือการ์ด 1 ใบจากโซลเพื่อคอล (บังคับลงแถวหลังตรงกลาง)";
                    viewerGrid.innerHTML = '';
                    zoneViewer.classList.remove('hidden');

                    soulPool.forEach((soulCard, index) => {
                        const clone = soulCard.cloneNode(true);
                        clone.classList.remove('dragging', 'rest', 'opponent-card');
                        clone.style.position = 'relative';
                        clone.style.cursor = 'pointer';

                        clone.onclick = (e) => {
                            e.stopPropagation();
                            const targetCircle = document.querySelector('.my-side .circle[data-zone="rc_back_center"]');
                            if (targetCircle) {
                                // 1. Move card from soul to target
                                const actualCard = soulPool.splice(index, 1)[0];
                                const existing = targetCircle.querySelector('.card:not(.opponent-card)');
                                if (existing) {
                                    const dropZone = document.querySelector('.my-side .drop-zone');
                                    dropZone.appendChild(existing);
                                    existing.classList.remove('rest');
                                    sendMoveData(existing);
                                }
                                targetCircle.appendChild(actualCard);
                                actualCard.classList.remove('rest');
                                actualCard.style.transform = 'none';
                                sendMoveData(actualCard);
                                updateSoulUI();
                                updateDropCount();

                                alert("คอลยูนิทลงช่องกลางแถวหลังแล้ว!");

                                // 2. Perform Soul Charge 1
                                console.log("Steve: Performing Soul Charge...");
                                soulCharge(1);
                                alert("ทำการ Soul Charge 1 เรียบร้อยแล้ว!");
                            }

                            zoneViewer.classList.add('hidden');
                            if (done) done();
                        };
                        viewerGrid.appendChild(clone);
                    });
                }
            });
        }

        // G2 Richard
        if (newName.includes('richard')) {
            queue.push({
                name: 'ความสามารถของ Richard (G2)',
                description: "[คอสต์: นำเรียร์การ์ด 1 ใบเข้าสู่โซล] เพื่อจั่วการ์ด 1 ใบ",
                resolve: async (done) => {
                    if (await vgConfirm("Richard Skill: [คอสต์: นำเรียร์การ์ด 1 ใบเข้าสู่โซล] เพื่อจั่วการ์ด 1 ใบ?")) {
                        promptRichardVC(done);
                    } else {
                        if (done) done();
                    }
                }
            });
        }

        // 3. Nirvana Jheva Ride Line Specifics
        // G0 Sunrise Egg -> G1 Rino
        if (oldName.includes('sunrise egg') && newName.includes('rino')) {
            // Drawn by Universal Grade 0 skill above if guest.
        }

        // G1 Rino -> G2 Reiyu
        if (oldName.includes('rino') && newName.includes('reiyu')) {
            queue.push({
                name: 'ความสามารถของ Rino (G1)',
                description: "ค้นหา Trickstar 1 ใบจากกองการ์ดคอลลง (RC)",
                resolve: async (done) => {
                    const confirmSearch = await vgConfirm("Rino Skill: ค้นหา Trickstar 1 ใบจากกองคอลลง (RC)?");
                    if (confirmSearch) {
                        promptSearchAndCall('Trickstar');
                    }
                    done();
                }
            });
        }

        // G2 Reiyu -> G3 Nirvana Jheva
        if (oldName.includes('reiyu') && newName.includes('nirvana jheva')) {
            queue.push({
                name: 'ความสามารถของ Reiyu (G2)',
                description: "ดูการ์ด 7 ใบจากบนสุดของกอง เลือก <Prayer Dragon> 1 ใบขึ้นมือ",
                resolve: async (done) => {
                    const confirmLook = await vgConfirm("Reiyu Skill: ดูการ์ด 7 ใบ เลือก Prayer Dragon (Equip Dragon) ขึ้นมือ?");
                    if (confirmLook) {
                        promptLookTop7ForPrayerDragon();
                    }
                    done();
                }
            });
        }

        // 4. Avantgarda Ride Line Specifics
        if (oldName.includes('findanis') && newName.includes('stelvane')) {
            queue.push({
                name: 'Findanis (G1) Ability',
                description: "ถ้าในโซลมี Sora Period ค้นหาเกรด 1 Strategy หากไม่เอาหรือหาไม่เจอ คอล Findanis ลง RC",
                resolve: async (done) => {
                    const hasSora = soulPool.some(c => c.dataset.name.includes('Sora Period'));
                    if (hasSora) {
                        if (await vgConfirm("Findanis: ค้นหาเกรด 1 Strategy ขึ้นมือ? (หากไม่เอา/ไม่เจอ จะได้คอลใบนี้ลง RC)")) {
                            let found = false;
                            const matches = deckPool.filter(c => c.name.includes("Strategy") && parseInt(c.grade) === 1);
                            if (matches.length > 0) {
                                openViewer("Select 1 Grade 1 Strategy", matches);
                                await new Promise(res => {
                                    const sel = (e) => {
                                        const clicked = e.target.closest('.card');
                                        if (clicked && clicked.parentElement === viewerGrid) {
                                            const tName = clicked.dataset.name;
                                            const idx = deckPool.findIndex(c => c.name === tName);
                                            if (idx !== -1) {
                                                const cardData = deckPool.splice(idx, 1)[0];
                                                const cardElem = createCardElement(cardData);
                                                playerHand.appendChild(cardElem);
                                                updateHandSpacing();
                                                sendMoveData(cardElem);
                                                updateDeckCounter();
                                                alert(`นำ ${cardData.name} ขึ้นมือ!`);
                                                found = true;
                                                zoneViewer.classList.add('hidden');
                                                viewerGrid.removeEventListener('click', sel);
                                                res();
                                            }
                                        }
                                    };
                                    viewerGrid.addEventListener('click', sel);
                                    closeViewerBtn.onclick = () => { zoneViewer.classList.add('hidden'); res(); };
                                });
                            }
                            if (!found) {
                                alert("ไม่พบ Strategy: เลือกคอล Findanis จากโซลลง RC");
                                promptCallSpecificFromSoul(oldVanguard);
                            }
                        } else {
                            promptCallSpecificFromSoul(oldVanguard);
                        }
                    }
                    done();
                }
            });
        }
        if (oldName.includes('stelvane') && (newName.includes('avantgarda'))) {
            queue.push({
                name: 'Stelvane (G2) Ability',
                description: "ถ้าในโซลมี Sora Period ค้นหาเกรด 2 Strategy หากไม่เอาหรือหาไม่เจอ คอล Stelvane ลง RC",
                resolve: async (done) => {
                    const hasSora = soulPool.some(c => c.dataset.name.includes('Sora Period'));
                    if (hasSora) {
                        if (await vgConfirm("Stelvane: ค้นหาเกรด 2 Strategy ขึ้นมือ? (หากไม่เอา/ไม่เจอ จะได้คอลใบนี้ลง RC)")) {
                            let found = false;
                            const matches = deckPool.filter(c => c.name.includes("Strategy") && parseInt(c.grade) === 2);
                            if (matches.length > 0) {
                                openViewer("Select 1 Grade 2 Strategy", matches);
                                await new Promise(res => {
                                    const sel = (e) => {
                                        const clicked = e.target.closest('.card');
                                        if (clicked && clicked.parentElement === viewerGrid) {
                                            const tName = clicked.dataset.name;
                                            const idx = deckPool.findIndex(c => c.name === tName);
                                            if (idx !== -1) {
                                                const cardData = deckPool.splice(idx, 1)[0];
                                                const cardElem = createCardElement(cardData);
                                                playerHand.appendChild(cardElem);
                                                updateHandSpacing();
                                                sendMoveData(cardElem);
                                                updateDeckCounter();
                                                alert(`นำ ${cardData.name} ขึ้นมือ!`);
                                                found = true;
                                                zoneViewer.classList.add('hidden');
                                                viewerGrid.removeEventListener('click', sel);
                                                res();
                                            }
                                        }
                                    };
                                    viewerGrid.addEventListener('click', sel);
                                    closeViewerBtn.onclick = () => { zoneViewer.classList.add('hidden'); res(); };
                                });
                            }
                            if (!found) {
                                alert("ไม่พบ Strategy: เลือกคอล Stelvane จากโซลลง RC");
                                promptCallSpecificFromSoul(oldVanguard);
                            }
                        } else {
                            promptCallSpecificFromSoul(oldVanguard);
                        }
                    }
                    done();
                }
            });
        }

        // 6. Youthberk Ride Line
        if (oldName.includes('determined to break away') && newName.includes('ardent light')) {
            queue.push({
                name: 'Determined to Break Away, Youth (G1)',
                description: 'When rode upon by G2 Youth, [SB1] look at top 3, choose "Youthberk" to hand OR call G2 or less to (RC).',
                resolve: async (done) => {
                    if (await vgConfirm("Youth (G1) Skill: [SB1] ค้นหาบน 3 ใบ เลือกเอา Youthberk ขึ้นมือ หรือ คอลยูนิทเกรด 2 หรือต่ำกว่าลง (RC) หรือไม่?")) {
                        if (await paySoulBlast(1)) {
                            if (deckPool.length < 3) { alert("การ์ดในกองไม่พอ!"); done(); return; }
                            const top3 = deckPool.slice(0, 3);
                            deckPool.splice(0, 3);

                            openViewer("เลือก Youthberk ขึ้นมือ หรือ การ์ดเกรด <= 2 ลงช่อง RC (หากไม่เลือก ให้กดปิดเพื่อนำการ์ดทั้งหมดไว้ใต้กอง)", top3);

                            let isResolved = false;
                            const cleanupAndDone = () => {
                                if (!isResolved) {
                                    isResolved = true;
                                    while (top3.length > 0) {
                                        deckPool.push(top3.shift());
                                    }
                                    updateDeckCounter();
                                    done();
                                }
                            };

                            const selListener = (e) => {
                                const clicked = e.target.closest('.card');
                                if (clicked && clicked.parentElement === viewerGrid) {
                                    const tName = clicked.dataset.name;
                                    const idx = top3.findIndex(c => c.name === tName);
                                    if (idx !== -1) {
                                        const cardData = top3[idx];
                                        const isYouthberk = cardData.name.toLowerCase().includes('youthberk');
                                        const isG2OrLessUnit = parseInt(cardData.grade) <= 2 && !cardData.skill?.includes('[Set Order]');

                                        if (isYouthberk && !isG2OrLessUnit) {
                                            const removed = top3.splice(idx, 1)[0];
                                            const cardElem = createCardElement(removed);
                                            playerHand.appendChild(cardElem);
                                            updateHandSpacing();
                                            sendMoveData(cardElem);
                                            alert(`นำ ${removed.name} ขึ้นมือ!`);
                                            zoneViewer.classList.add('hidden');
                                            viewerGrid.removeEventListener('click', selListener);
                                            cleanupAndDone();
                                        } else if (isYouthberk && isG2OrLessUnit) {
                                            if (confirm(`คุณต้องการเลือกนำ ${cardData.name} ขึ้นมือ (กด ตกลง) หรือคอลลงช่อง RC (กด ยกเลิก)?`)) {
                                                const removed = top3.splice(idx, 1)[0];
                                                const cardElem = createCardElement(removed);
                                                playerHand.appendChild(cardElem);
                                                updateHandSpacing();
                                                sendMoveData(cardElem);
                                                alert(`นำ ${removed.name} ขึ้นมือ!`);
                                                zoneViewer.classList.add('hidden');
                                                viewerGrid.removeEventListener('click', selListener);
                                                cleanupAndDone();
                                            } else {
                                                rcCallFlow(idx);
                                            }
                                        } else if (!isYouthberk && isG2OrLessUnit) {
                                            rcCallFlow(idx);
                                        } else {
                                            alert(`ไม่สามารถเลือกใบนี้ได้ (${cardData.name})`);
                                        }

                                        function rcCallFlow(cardIdx) {
                                            alert(`เลือกคอล ${top3[cardIdx].name} กรุณาคลิกช่องวงกลม (RC) ที่ต้องการลง`);
                                            zoneViewer.classList.add('hidden');
                                            document.body.classList.add('targeting-mode');

                                            const rcCallListener = (ev) => {
                                                const circle = ev.target.closest('.circle.rc');
                                                if (circle) {
                                                    ev.stopPropagation();
                                                    document.removeEventListener('click', rcCallListener, true);
                                                    document.body.classList.remove('targeting-mode');

                                                    const removed = top3.splice(cardIdx, 1)[0];
                                                    const existing = circle.querySelector('.card:not(.opponent-card)');
                                                    if (existing) {
                                                        document.querySelector('.my-side .drop-zone').appendChild(existing);
                                                        existing.classList.remove('rest');
                                                        sendMoveData(existing);
                                                    }
                                                    const newElem = createCardElement(removed);
                                                    circle.appendChild(newElem);
                                                    newElem.classList.remove('rest');
                                                    newElem.style.transform = 'none';
                                                    sendMoveData(newElem);
                                                    applyStaticBonuses(newElem);
                                                    alert(`คอล ${removed.name} สำเร็จ!`);
                                                    viewerGrid.removeEventListener('click', selListener);
                                                    cleanupAndDone();
                                                }
                                            };
                                            document.addEventListener('click', rcCallListener, true);
                                        }
                                    }
                                }
                            };

                            viewerGrid.addEventListener('click', selListener);
                            closeViewerBtn.onclick = () => { zoneViewer.classList.add('hidden'); viewerGrid.removeEventListener('click', selListener); cleanupAndDone(); };
                        } else {
                            done();
                        }
                    } else {
                        done();
                    }
                }
            });
        }

        if (oldName.includes('ardent light') && (newName.includes('skyfall') || newName.includes('revoldress') || newCard.dataset.skill.toLowerCase().includes('revoldress'))) {
            queue.push({
                name: 'Knight of Ardent Light, Youth (G2)',
                description: 'When rode upon by a unit with [RevolDress], [CB1] choose a G2 or greater from drop to hand.',
                resolve: async (done) => {
                    const confirmDrop = await vgConfirm("Youth (G2) Skill: [CB1] เลือกการ์ดเกรด 2 หรือสูงกว่าจากช่องดรอปขึ้นมือ?");
                    if (confirmDrop) {
                        if (payCounterBlast(1)) {
                            const dropZone = document.querySelector('.my-side .drop-zone');
                            const dropCards = Array.from(dropZone.querySelectorAll('.card'));
                            const validCards = dropCards.filter(c => parseInt(c.dataset.grade) >= 2);

                            if (validCards.length === 0) {
                                alert("ไม่มีการ์ดเกรด 2 หรือสูงกว่าในช่องดรอป");
                                done();
                                return;
                            }

                            viewerTitle.textContent = "เลือกการ์ดเกรด 2 หรือสูงกว่า 1 ใบขึ้นมือ";
                            viewerGrid.innerHTML = '';
                            zoneViewer.classList.remove('hidden');

                            const cleanupDropAndDone = () => { zoneViewer.classList.add('hidden'); done(); };

                            validCards.forEach(c => {
                                const clone = c.cloneNode(true);
                                clone.classList.remove('dragging', 'rest', 'opponent-card');
                                clone.style.position = 'relative';
                                clone.style.cursor = 'pointer';

                                clone.onclick = () => {
                                    c.remove();
                                    const newHandCard = createCardElement(JSON.parse(c.dataset.cardData));
                                    playerHand.appendChild(newHandCard);
                                    updateHandSpacing();
                                    sendMoveData(newHandCard);
                                    updateDropCount();
                                    alert(`นำ ${newHandCard.dataset.name} ขึ้นมือ!`);
                                    cleanupDropAndDone();
                                };
                                viewerGrid.appendChild(clone);
                            });
                            closeViewerBtn.onclick = cleanupDropAndDone;
                        } else {
                            done();
                        }
                    } else {
                        done();
                    }
                }
            });
        }


        // 4. Majesty Lord Blaster Ride Line
        // Maron (G1) override by Blaster G2
        if (oldName.includes('maron') && newName.includes('blaster')) {
            queue.push({
                name: 'ความสามารถของ Maron (G1)',
                description: "ดูการ์ด 7 ใบจากบนสุดของกอง เลือกเกรด 2 ที่มีคำว่า 'Blaster' ขึ้นมือ หากไม่เจอคอล Wingul Brave จากโซล",
                resolve: async (done) => {
                    if (await vgConfirm("Maron Skill: ดูการ์ด 7 ใบ เลือกเกรด 2 'Blaster' ขึ้นมือ?")) {
                        promptMajestyLookTop7(done);
                    } else {
                        if (done) done();
                    }
                }
            });
        }

        // Blaster Blade (G2) on VC
        if (newName === 'blaster blade') {
            queue.push({
                name: 'ความสามารถของ Blaster Blade (VC)',
                description: "[CB1] รีไทร์เรียร์การ์ดคู่แข่ง 1 ใบ หากไม่รีไทร์ จั่วการ์ด 1 ใบ",
                resolve: async (done) => {
                    if (await vgConfirm("Blaster Blade Skill: [CB1] รีไทร์เรียร์การ์ดคู่แข่ง 1 ใบ?")) {
                        if (payCounterBlast(1)) {
                            promptMajestyRetireOrDraw(done);
                        } else {
                            if (done) done();
                        }
                    } else {
                        if (done) done();
                    }
                }
            });
        }

        // 3. Magnolia Ride Line
        // Magnolia Elder (G4)
        if (newName.includes('elder')) {
            queue.push({
                name: 'Magnolia Elder [AUTO]',
                description: "เลือกการ์ด 1 ใบจากโซล คอลลง (RC)",
                resolve: async (done) => {
                    if (soulPool.length === 0) {
                        alert("ไม่มีการ์ดในโซล!");
                        if (done) done();
                        return;
                    }

                    if (await vgConfirm("Magnolia Elder Skill: คอลการ์ด 1 ใบจากโซลลง (RC)?")) {
                        viewerTitle.textContent = "เลือกการ์ด 1 ใบจากโซลเพื่อคอล";
                        viewerGrid.innerHTML = '';
                        zoneViewer.classList.remove('hidden');

                        soulPool.forEach((soulCard, index) => {
                            const clone = soulCard.cloneNode(true);
                            clone.classList.remove('dragging', 'rest', 'opponent-card');
                            clone.style.position = 'relative';
                            clone.style.cursor = 'pointer';

                            clone.onclick = (e) => {
                                e.stopPropagation();
                                alert("คลิกที่วงกลม (RC) ที่ว่างอยู่เพื่อคอลยูนิท");
                                zoneViewer.classList.add('hidden');
                                document.body.classList.add('targeting-mode');

                                const soulCallListener = (ev) => {
                                    const circle = ev.target.closest('.circle.rc');
                                    if (circle) {
                                        ev.stopPropagation();
                                        const actualCard = soulPool.splice(index, 1)[0];
                                        const existing = circle.querySelector('.card:not(.opponent-card)');
                                        if (existing) {
                                            const dropZone = document.querySelector('.my-side .drop-zone');
                                            dropZone.appendChild(existing);
                                            existing.classList.remove('rest');
                                            sendMoveData(existing);
                                        }
                                        circle.appendChild(actualCard);
                                        actualCard.classList.remove('rest');
                                        actualCard.style.transform = 'none';
                                        sendMoveData(actualCard);
                                        updateSoulUI();
                                        updateDropCount();
                                        applyStaticBonuses(actualCard);
                                        document.body.classList.remove('targeting-mode');
                                        document.removeEventListener('click', soulCallListener, true);
                                        if (done) done();
                                    }
                                };
                                document.addEventListener('click', soulCallListener, true);
                            };
                            viewerGrid.appendChild(clone);
                        });
                    } else {
                        if (done) done();
                    }
                }
            });
        }

        // 5. Discarded for Ride specific abilities (Generic/Placeholder infrastructure)
        if (discardedCard) {
            const discardedName = (discardedCard.dataset.name || "").toLowerCase();
            // Example: Discarded card has specific ability
            if (discardedName.includes('some_ability_card')) {
                queue.push({
                    name: `ทักษะจากการทิ้ง: ${discardedCard.dataset.name}`,
                    description: "ความสามารถเมื่อถูกทิ้งเพื่อไรด์",
                    resolve: async (done) => {
                        alert(`ใช้งานความสามารถของ ${discardedCard.dataset.name} จากการถูกทิ้ง!`);
                        // Logic here
                        done();
                    }
                });
            }
        }

        console.log(`Ability Queue built: ${queue.length} items.`);
        if (queue.length > 0) {
            return await resolveAbilityQueue(queue);
        }
    }
    function findCounterTrigger(type) {
        return deckPool.find(c => c.trigger === type);
    }



    function createCardElement(cardData) {
        const card = document.createElement('div');
        card.className = 'card';
        card.draggable = true;
        // Use prefix to prevent ID collision between players
        const prefix = isHost ? 'h-' : 'g-';
        card.id = `${prefix}card-${cardIdCounter++}`;
        card.dataset.grade = cardData.grade;
        card.dataset.power = cardData.power;
        card.dataset.basePower = cardData.power;
        card.dataset.critical = cardData.critical || 1;
        card.dataset.baseCritical = card.dataset.critical;
        card.dataset.shield = cardData.shield || 0;
        card.dataset.baseShield = card.dataset.shield;
        card.dataset.trigger = cardData.trigger || '';
        card.dataset.name = cardData.name;
        card.dataset.skill = cardData.skill || 'No skill description available.';
        card.dataset.cardType = cardData.type || 'Unit';
        card.dataset.persona = cardData.persona ? "true" : "false";
        card.dataset.isPG = cardData.isPG ? "true" : "false";
        card.dataset.imageUrl = cardData.imageUrl || "";
        card.dataset.cardData = JSON.stringify(cardData);

        // Grade Reduction Helper (e.g., Winnsapooh)
        card.getEffectiveGrade = function () {
            let baseGrade = parseInt(card.dataset.grade);
            const name = (card.dataset.name || "").toLowerCase();
            if (name.includes('winnsapooh')) {
                const vg = document.querySelector('.my-side .circle.vc .card');
                if (vg) {
                    const vgGrade = parseInt(vg.dataset.grade);
                    const vgName = (vg.dataset.name || "").toLowerCase();
                    if (vgGrade >= 2 && vgName.includes('sylvan horned beast') && !vgName.includes('winnsapooh')) {
                        return Math.max(0, baseGrade - 1);
                    }
                }
            }
            return baseGrade;
        };

        const artText = cardData.name.substring(0, 3).toUpperCase();
        let triggerIcon = cardData.trigger ? `<div class="card-trigger bg-${cardData.trigger.toLowerCase()}">${cardData.trigger[0]}</div>` : '';
        let personaIcon = cardData.persona ? `<div class="card-persona">Persona</div>` : '';
        let displayPower = cardData.overPower ? '100M' : cardData.power;
        let displayCritical = parseInt(card.dataset.critical) > 1 ? `<span style="color:gold;">★${card.dataset.critical}</span>` : '';

        const cardName = (cardData.name || "").trim();
        const artUrl = cardData.imageUrl || cardImages[cardName] || '';
        card.dataset.imageUrl = artUrl; // Store for other viewers
        const artStyle = artUrl ? `style="background-image: url('${artUrl}'); background-size: cover; background-position: center;"` : '';
        const artDisplay = artUrl ? '' : artText;

        card.innerHTML = `
            <div class="card-header">
                <span class="card-grade">G${cardData.grade}</span>
                ${triggerIcon}
            </div>
            <div class="card-art" ${artStyle}>${artDisplay}</div>
            ${personaIcon}
            <div class="card-details">
                <span class="card-power">⚔️${displayPower} ${displayCritical}</span>
                <span class="card-shield">🛡️${cardData.shield || 0}</span>
            </div>
        `;

        card.title = cardData.name;

        // Click Selection for Ride/Discard Logic
        card.onclick = (e) => {
            const inHand = card.parentElement.dataset.zone === 'hand';
            if (inHand && phases[currentPhaseIndex] === 'ride' && isMyTurn) {
                // Deselect others
                document.querySelectorAll('.player-hand .card.selected-for-ride').forEach(c => {
                    if (c !== card) c.classList.remove('selected-for-ride');
                });
                card.classList.toggle('selected-for-ride');
                if (card.classList.contains('selected-for-ride')) {
                    console.log("Card selected for ride/discard:", card.dataset.name);
                }
            }
        };

        // Long Press Logic for Skill Viewing
        let longPressTimer;
        let isLongPress = false;
        const longPressDuration = 1500; // 1.5 seconds
        let lastClickTime = 0;

        const startLongPress = (e) => {
            isLongPress = false;
            longPressTimer = setTimeout(() => {
                isLongPress = true;
                openSkillViewer(card);
            }, longPressDuration);
        };

        const cancelLongPress = () => {
            clearTimeout(longPressTimer);
        };

        card.addEventListener('mousedown', startLongPress);
        card.addEventListener('touchstart', startLongPress, { passive: true });

        card.addEventListener('mouseup', cancelLongPress);
        card.addEventListener('mouseleave', cancelLongPress);
        card.addEventListener('touchend', cancelLongPress);
        card.addEventListener('touchmove', cancelLongPress, { passive: true });

        // Context Menu as reliable alternative for Skill Viewing
        card.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            openSkillViewer(card);
        });

        card.addEventListener('dragstart', (e) => {
            const inHand = card.parentElement.dataset.zone === 'hand';
            const isGrade2FrontRow = card.dataset.grade == "2" && card.parentElement.dataset.zone && card.parentElement.dataset.zone.startsWith('rc_front_');
            const isOnField = card.parentElement.classList.contains('circle');

            const parent = card.parentElement;
            const isRestricted = parent.classList.contains('drop-zone') ||
                parent.classList.contains('damage-zone') ||
                parent.classList.contains('ride-deck-zone') ||
                parent.classList.contains('order-zone');

            if (isRestricted) {
                e.preventDefault();
                return;
            }

            if (!isMyTurn) {
                if (!isGuarding) {
                    e.preventDefault();
                    return;
                } else {
                    const isElderActive = isMagnoliaElderSkillActive();
                    const isFromVC = parent.classList.contains('vc');
                    const isFromGC = parent.classList.contains('guardian-circle') || parent.dataset.zone === 'gc_player';
                    const isInterceptable = isGrade2FrontRow || (isElderActive && isOnField && !isFromVC);
                    if (!inHand && !isInterceptable && !isFromGC) {
                        e.preventDefault();
                        return;
                    }
                }
            } else {
                if (isOnField) {
                    const currentPhase = phases[currentPhaseIndex];
                    const zone = card.parentElement.dataset.zone;
                    const isVanguard = card.parentElement.classList.contains('vc');
                    const isLeftOrRightRG = zone && (zone.includes('_left') || zone.includes('_right'));

                    // Allow moving Rear-guards during Main Phase (ONLY within the same column)
                    if (currentPhase === 'main' && !isVanguard) {
                        // Allowed
                    } else {
                        e.preventDefault();
                        return;
                    }
                }
            }
            draggedCard = card;
            setTimeout(() => card.classList.add('dragging'), 0);
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', card.id);
        });

        card.addEventListener('dragend', () => {
            if (draggedCard) draggedCard.classList.remove('dragging');
            draggedCard = null;
            updateHandCount();
        });

        card.addEventListener('click', (e) => {
            const currentTime = new Date().getTime();
            const tapGap = currentTime - lastClickTime;

            // Double click/tap for skill viewing
            if (tapGap < 350 && tapGap > 0) {
                openSkillViewer(card);
                lastClickTime = 0; // Reset
                return;
            }
            lastClickTime = currentTime;

            if (isLongPress) {
                isLongPress = false;
                return;
            }
            if (document.body.classList.contains('targeting-mode')) {
                if (card.parentElement.classList.contains('circle') && !card.classList.contains('opponent-card')) {
                    if (targetingType === 'critical') {
                        let currentCrit = parseInt(card.dataset.critical || 1);
                        card.dataset.critical = currentCrit + pendingCriticalIncrease;
                        pendingCriticalIncrease = 0;
                        alert(`+1 Critical applied to ${card.dataset.name}!`);

                        if (pendingPowerIncrease > 0) {
                            targetingType = 'power';
                            alert(`Step 2: Select a unit to receive +${pendingPowerIncrease >= 1000000 ? '100M' : pendingPowerIncrease} Power.`);
                        } else {
                            targetingType = null;
                            document.body.classList.remove('targeting-mode');
                        }
                    } else if (targetingType === 'power' || targetingType === 'both') {
                        let currentPower = parseInt(card.dataset.power);
                        card.dataset.power = currentPower + pendingPowerIncrease;

                        if (targetingType === 'both') {
                            let currentCrit = parseInt(card.dataset.critical || 1);
                            card.dataset.critical = currentCrit + pendingCriticalIncrease;
                            pendingCriticalIncrease = 0;
                        }

                        pendingPowerIncrease = 0;
                        targetingType = null;
                        document.body.classList.remove('targeting-mode');
                        alert(`Power applied to ${card.dataset.name}!`);
                    }

                    const powerSpan = card.querySelector('.card-power');
                    if (powerSpan) {
                        let displayCritical = parseInt(card.dataset.critical) > 1 ? `<span style="color:gold;">★${card.dataset.critical}</span>` : '';
                        powerSpan.innerHTML = `⚔️${parseInt(card.dataset.power) >= 100000 ? '100M' : card.dataset.power} ${displayCritical}`;
                    }

                    sendMoveData(card);
                } else if (card.classList.contains('opponent-card')) {
                    alert("You must select your own unit!");
                }
                return;
            }

            if (!isMyTurn && !isGuarding) return; // Strict turn check

            const currentPhase = phases[currentPhaseIndex];

            let effectiveCard = card;
            if (card.dataset.originalId) {
                effectiveCard = document.getElementById(card.dataset.originalId) || card;
            }

            if (effectiveCard.parentElement && effectiveCard.parentElement.classList.contains('order-zone') && effectiveCard.parentElement.closest('.opponent-side')) {
                if (isMyTurn && currentPhase === 'main' && !effectiveCard.classList.contains('opponent-card') && effectiveCard.classList.contains('imprisoned-card')) {
                    // Open prison viewer to allow choosing bailout method
                    window.viewPrisonZone('opp');
                    return;
                }
            }

            // TAP TO MOVE (Mobile Friendly)
            const isInGC = card.parentElement && (card.parentElement.classList.contains('guardian-circle') || card.parentElement.dataset.zone === 'gc_player');
            const canSelect = (isMyTurn && currentPhase !== 'battle') || isGuarding || isInGC;
            if (canSelect && !card.classList.contains('opponent-card')) {
                // If a card is already selected and we tap a card ON THE FIELD, assume we want to place it in that circle, 
                // so don't steal the selection. Let it bubble to the zone listener.
                if (selectedCard && selectedCard !== card && card.parentElement && card.parentElement.classList.contains('circle')) {
                    return; // Let the event bubble to the circle listener
                }

                if (selectedCard) selectedCard.classList.remove('card-selected');

                if (selectedCard === card) {
                    selectedCard = null;
                } else {
                    selectedCard = card;
                    card.classList.add('card-selected');
                }
                // Stop propagation for GC cards so the GC container doesn't clear the selection
                if (isInGC) e.stopPropagation();
                return;
            }

            if (currentPhase === 'battle' && isMyTurn) {
                if (!attackingCard) {
                    if (card.parentElement.classList.contains('circle') && !card.classList.contains('rest')) {
                        if (card.classList.contains('opponent-card')) return;
                        // Prevent backrow from attacking
                        if (card.parentElement.dataset.zone && card.parentElement.dataset.zone.startsWith('rc_back_')) {
                            // Bug Fix: Check for Magnolia Elder or temporary backrow attack abilities
                            if (!isMagnoliaElderSkillActive() && card.dataset.canAttackFromBack !== "true") {
                                alert("Backrow units cannot attack!");
                                return;
                            }
                        }
                        attackingCard = card;
                        card.classList.add('attacking-glow');
                        // Show current critical on attack
                        showPowerPopup(card, card.dataset.critical || "1", 'current-crit');
                    }
                } else {
                    if (card !== attackingCard) {
                        performAttack(attackingCard, card);
                        attackingCard.classList.remove('attacking-glow');
                        attackingCard = null;
                    }
                }
                return;
            }

            // --- CLICK INTERACTION FOR OWN ORDER ZONE ---
            if (card.parentElement && card.parentElement.classList.contains('order-zone') && card.parentElement.closest('.my-side')) {
                if (isMyTurn && phases[currentPhaseIndex] === 'main') {
                    activateCardSkill(card);
                    return;
                }
            }
        });

        return card;
    }

    function sendMoveData(card, explicitZone) {
        if (!card) return;
        let pZone = explicitZone;
        if (!pZone) {
            const parent = card.parentElement;
            if (parent) {
                if (parent.dataset && parent.dataset.zone) {
                    pZone = parent.dataset.zone;
                } else if (parent.classList.contains('vc')) {
                    pZone = 'vc';
                } else if (parent.classList.contains('rc')) {
                    // Detect specific RC IDs or relative zones
                    pZone = parent.id || (parent.dataset.zone) || 'rc';
                } else if (parent.id) {
                    pZone = parent.id;
                }
            }

            if (!pZone) {
                if (soulPool.includes(card)) pZone = 'soul';
                else if (deckPool.includes(card)) pZone = 'deck';
                else pZone = 'unknown';
            }
        }

        sendData({
            type: 'moveCard',
            cardId: card.id,
            cardName: card.dataset.name,
            zone: pZone,
            isRest: card.classList.contains('rest'),
            isFaceDown: card.classList.contains('face-down'),
            isImprisoned: card.classList.contains('imprisoned-card'),
            grade: card.dataset.grade,
            power: card.dataset.power,
            critical: card.dataset.critical,
            shield: card.dataset.shield,
            imageUrl: card.dataset.imageUrl,
            cardData: card.dataset.cardData,
            basePower: card.dataset.basePower,
            baseCritical: card.dataset.baseCritical,
            skill: card.dataset.skill, // Send skill text to opponent
            isOD: card.dataset.isOverDress === "true",
            isXOD: card.dataset.isXoverDress === "true"
        });
    }

    function sendRemoveData(card) {
        if (!card) return;
        sendData({ type: 'removeCard', cardId: card.id });
    }

    function drawCard(isInitial = false) {
        if (!isMyTurn && !isInitial) return;
        if (deckPool.length === 0) {
            if (!isInitial) {
                alert("Deck out! You lose.");
                showGameOver('Lose');
            }
            return;
        }
        const cardData = deckPool.pop();
        const newCard = createCardElement(cardData);
        playerHand.appendChild(newCard);
        updateHandSpacing();
        updateDeckCounter();

        // Sync hand count AND the card itself if it's hand (optional: Vanguard usually hides hand)
        // For this request, we'll sync the move so it appears in opponent's hand zone
        sendData({ type: 'syncHandCount', count: playerHand.querySelectorAll('.card').length });
        sendMoveData(newCard);
    }

    function triggerShake() {
        const board = document.querySelector('.board-area');
        if (board) {
            board.classList.remove('shake');
            void board.offsetWidth; // Force reflow
            board.classList.add('shake');
            setTimeout(() => board.classList.remove('shake'), 500);
        }
    }

    let isDealingDamage = false;
    function dealDamage(checksLeft = 1) {
        if (checksLeft <= 0 || isDealingDamage) return;
        isDealingDamage = true;
        triggerShake();

        if (deckPool.length === 0) {
            alert("Deck out! You lose.");
            showGameOver('Lose');
            return;
        }

        const cardData = deckPool.pop();
        updateDeckCounter();
        const checkCard = createCardElement(cardData);
        checkCard.style.position = 'fixed';
        checkCard.style.top = '50%';
        checkCard.style.left = '50%';
        checkCard.style.transform = 'translate(-50%, -50%) scale(1.5)';
        checkCard.style.zIndex = '9999';
        checkCard.style.pointerEvents = 'none'; // Prevent blocking unit clicks
        checkCard.classList.add('effect-trigger');
        document.body.appendChild(checkCard);

        sendData({ type: 'revealDrive', cardData: cardData, isFirst: false });

        setTimeout(() => {
            if (cardData.trigger) {
                resolveTrigger(cardData, true);
            } else {
                pendingPowerIncrease = 0;
                pendingCriticalIncrease = 0;
                document.body.classList.remove('targeting-mode');
            }

            // Start waiting ONLY AFTER we've decided if there's a trigger
            const waitLoop = setInterval(() => {
                if (!document.body.classList.contains('targeting-mode')) {
                    clearInterval(waitLoop);
                    setTimeout(finishDamageProcess, 1500);
                }
            }, 2000); // Give a bit more time for OT resolve
        }, 500);

        function finishDamageProcess() {
            if (cardData.trigger === 'Over') {
                alert("Over Trigger ออกตอนเช็คดาเมจ! (เลือกยูนิทรับพลัง 100M) และข้ามดาเมจใบนี้");
                
                bindPool.push(cardData);
                if (checkCard) checkCard.remove();
                syncCounts();
                sendData({ type: 'syncBindCount', count: bindPool.length });

                isDealingDamage = false; 
                if (checksLeft > 1) {
                    setTimeout(() => dealDamage(checksLeft - 1), 800);
                }
                return;
            }

            if (checkCard) checkCard.remove();
            const damageCard = createCardElement(cardData);
            const damageZone = document.querySelector('.my-side .damage-zone');
            damageZone.appendChild(damageCard);
            sendMoveData(damageCard);

            const damageCount = document.querySelectorAll('.my-side .damage-zone .card').length;
            sendData({ type: 'syncDamageCount', count: damageCount });
            updateDamageCount();

            const vanguardChild = document.querySelector('.my-side .circle.vc .card');
            const vanguardName = vanguardChild ? vanguardChild.dataset.name : "";
            const hasBaseGreedonInSoul = soulPool.some(c => c.dataset.name && c.dataset.name === 'Avaricious Demonic Dragon, Greedon');
            const maxDamage = (vanguardName.includes('Greedon Masques') || (vanguardName === 'Avaricious Demonic Dragon, Greedon' && hasBaseGreedonInSoul)) ? 7 : 6;

            if (damageCount >= maxDamage) {
                alert(`${maxDamage} Damage! You lose.`);
                showGameOver('Lose');
                return;
            }

            if (checksLeft > 1) {
                isDealingDamage = false; // Reset to allow next damage check in sequence
                setTimeout(() => dealDamage(checksLeft - 1), 800);
            } else {
                isDealingDamage = false;
            }
        }
    }

    async function attackHitCheck(initialCritical, isOpponentPG = false) {
        if (!currentAttackData) return;

        const attacker = document.getElementById(currentAttackData.attackerId);
        let target = null;
        if (isAIMode) {
            target = document.querySelector(`.opponent-side .circle[data-zone="${currentAttackData.targetId}"] .card`);
        } else {
            target = document.getElementById(currentAttackData.targetId) || document.querySelector(`.circle[data-zone="${currentAttackData.targetId}"] .card`);
        }

        if (!attacker || !target) {
            console.error("Battle resolution failed: Attacker or Target not found.", { attackerId: currentAttackData.attackerId, targetId: currentAttackData.targetId });
            currentAttackData = null;
            isWaitingForGuard = false;
            currentAttackResolving = false;
            return;
        }

        // Recalculate based on current state (AFTER DRIVE TRIGGERS)
        const attackerPower = parseInt(attacker.dataset.power || "0");
        const boostPower = parseInt(currentAttackData.boostPower || "0");
        let finalPower = attackerPower + boostPower;
        let finalCritical = parseInt(attacker.dataset.critical || "1");

        // Find target power - it's on our locally synced version of opponent's card
        const opponentShield = parseInt(currentAttackData.opponentShield || "0");
        const targetBasePower = parseInt(target.dataset.power || "0");
        let targetDefendingPower = targetBasePower + opponentShield;

        const isHit = finalPower >= targetDefendingPower;
        console.log(`Attack Resolution Check: Attacker ${finalPower} vs Target ${targetDefendingPower}. isHit: ${isHit}`);

        // --- Derii Violet Restriction Check ---
        let finalHit = isHit;
        if (target.dataset.cannotBeHitByG2Lower === "true") {
            const attackerGrade = parseInt(attacker.dataset.grade || "0");
            if (attackerGrade <= 2) {
                alert("สกิล Derii Violet ทำงาน! เนื่องจากยูนิทที่โจมตีมีเกรด 2 หรือต่ำกว่า จึงไม่สามารถทำให้การโจมตีฮิตได้!");
                finalHit = false;
            }
        }

        // Check for Perfect Guard (PG) on target side if we were the attacker
        // In local logic, if opponent used PG, we handle it during their finishGuard callback which sets opponentShield
        // However, we should check if any PG was placed.
        const gc = document.querySelector('.guardian-circle');
        const hasPG = gc && Array.from(gc.querySelectorAll('.card')).some(c => c.dataset.name.includes('Perfect Guard') || c.dataset.isPG === "true");

        if (hasPG || isOpponentPG) {
            alert("Perfect Guard activated! Attack is nullified.");
            await sendData({
                type: 'resolveAttack',
                attackData: {
                    ...currentAttackData,
                    totalPower: finalPower,
                    totalCritical: finalCritical,
                    isHit: false,
                    isPG: true
                }
            });
        } else {
            if (isHit) {
                alert(`Attack hit! ${finalPower} Power vs ${targetDefendingPower} Def. Resolving damage...`);
            } else {
                alert(`Attack missed! ${finalPower} Power is not enough to hit ${targetDefendingPower} Power (Base + Shield: ${opponentShield}).`);
            }

            await sendData({
                type: 'resolveAttack',
                attackData: {
                    ...currentAttackData,
                    totalPower: finalPower,
                    totalCritical: finalCritical,
                    isHit: finalHit
                }
            });
        }

        currentAttackData.isHit = (hasPG || isOpponentPG) ? false : finalHit;
        
        // Reset Derii Violet restriction
        if (target.dataset.cannotBeHitByG2Lower === "true") {
            target.dataset.cannotBeHitByG2Lower = "false";
        }

        // --- Overlord On-Hit Abilities ---
        if (currentAttackData.isHit && attacker.dataset.side !== 'opponent') {
            const attackerName = attacker.dataset.name || "";
            const isVG = attacker.parentElement.classList.contains('vc');

            // --- Dragonic Overlord [AUTO](VC)[1/turn] ---
            if (attackerName.includes('Dragonic Overlord') && !attackerName.includes('the End') && isVG && attacker.dataset.onHitTargetUsed !== "true") {
                if (await vgConfirm("Dragonic Overlord: [AUTO](VC) เมื่อโจมตีฮิต จ่าย [CB1] และทิ้งการ์ด 1 ใบ เพื่อ Stand และไดร์ฟ -1?")) {
                    if (payCounterBlast(1)) {
                        await payDiscard(1);
                        attacker.classList.remove('rest');
                        attacker.dataset.drive = Math.max(0, parseInt(attacker.dataset.drive || "2") - 1);
                        attacker.dataset.onHitTargetUsed = "true";
                        sendMoveData(attacker);
                        alert("Dragonic Overlord Stand! (Drive -1)");
                    }
                }
            }

            // --- Blast Artillery Dragon, Brachioforce [AUTO](RC) ---
            if (attackerName.includes('Brachioforce') && !isVG) {
                await handleBrachioforceEffect(attacker, currentAttackData);
            }

            // --- VG hit triggers (Bahr, Gojo) ---
            if (isVG) {
                document.querySelectorAll('.my-side .circle.rc .card:not(.opponent-card)').forEach(u => {
                    if (u.dataset.name.includes('Embodiment of Armor, Bahr')) {
                        if (u.dataset.bahrHitUsed !== "true") {
                            u.dataset.power = (parseInt(u.dataset.power) + 5000).toString();
                            u.dataset.turnEndBuffPower = (parseInt(u.dataset.turnEndBuffPower || "0") + 5000).toString();
                            u.dataset.turnEndBuffActive = "true";
                            u.dataset.bahrHitUsed = "true";
                            syncPowerDisplay(u);
                            sendMoveData(u);
                            alert("Bahr: แวนการ์ดโจมตีฮิต! พลัง +5000 จนจบเทิร์น");
                        }
                    }
                });

                if (currentAttackData.boostPower > 0) {
                    const backZoneName = currentAttackData.attackerZone === 'vc' ? 'rc_back_center' : null;
                    if (backZoneName) {
                        const boosterCard = document.querySelector(`.my-side .circle[data-zone="${backZoneName}"] .card:not(.opponent-card)`);
                        if (boosterCard && boosterCard.dataset.name.includes('Dragon Monk, Gojo')) {
                            if (await vgConfirm("Gojo: [AUTO](RC) แวนการ์ดที่บูสต์โจมตีฮิต [Retire ยูนิตนี้] เพื่อ [Counter-Charge 1]?")) {
                                const dropZone = document.querySelector('.my-side .drop-zone');
                                dropZone.appendChild(boosterCard);
                                boosterCard.classList.remove('rest');
                                sendMoveData(boosterCard);
                                updateDropCount();
                                counterCharge(1);
                                alert("Gojo: ทำการ [Counter-Charge 1] สำเร็จ!");
                            }
                        }
                    }
                }
            }
        }

        await handleEndOfBattle(attacker, currentAttackData);
        currentAttackData = null;
        pendingCriticalIncrease = 0;
        
        // --- Reset Guard Restrict (Fuujo) ---
        attacker.dataset.guardRestrictCount = "0";
        document.body.classList.remove('guard-restricted');

        // Ensure flags are reset AFTER battle resolution logic completes
        isWaitingForGuard = false;
        currentAttackResolving = false;
        checkAllAttackersRested();
    }


    function driveCheck(count, crit, isOpponentPG = false) {
        if (count <= 0) {
            // If PG was played, override hit check
            if (isOpponentPG) {
                alert("Attack Nullified by Perfect Guard!");
                sendData({
                    type: 'resolveAttack',
                    attackData: {
                        ...currentAttackData,
                        totalPower: parseInt(document.getElementById(currentAttackData.attackerId).dataset.power),
                        totalCritical: crit,
                        isHit: false, // Force miss
                        isPG: true
                    }
                });
            } else {
                attackHitCheck(crit, isOpponentPG);
            }
            // Reset resolve lock
            setTimeout(() => {
                currentAttackResolving = false;
                isWaitingForGuard = false;
            }, 500);
            return;
        }

        if (deckPool.length === 0) {
            alert("Deck out! You lose.");
            showGameOver('Lose');
            return;
        }

        const cardData = deckPool.pop();
        updateDeckCounter();

        // Show the card as a floating "check" element
        const checkCard = createCardElement(cardData);
        checkCard.style.position = 'fixed';
        checkCard.style.top = '50%';
        checkCard.style.left = '50%';
        checkCard.style.transform = 'translate(-50%, -50%) scale(1.5)';
        checkCard.style.zIndex = '9999';
        checkCard.style.pointerEvents = 'none';
        checkCard.classList.add('effect-trigger');
        document.body.appendChild(checkCard);

        sendData({ type: 'revealDrive', cardData: cardData, isFirst: false });

        setTimeout(() => {
            if (cardData.trigger) {
                resolveTrigger(cardData);
            } else {
                pendingPowerIncrease = 0;
                pendingCriticalIncrease = 0;
                document.body.classList.remove('targeting-mode');
            }

            const finishThisCheck = () => {
                if (checkCard && checkCard.parentElement) {
                    checkCard.remove();
                }
                
                // Check if it's an Over Trigger - move to Bind (Remove Zone)
                if (cardData.trigger === 'Over') {
                    alert("Over Trigger! เข้าสู่ Remove Zone (Bind) และประมวลผลพลัง 100M");
                    bindPool.push(cardData);
                    syncCounts();
                    sendData({ type: 'syncBindCount', count: bindPool.length });
                } else {
                    const cardInHand = createCardElement(cardData);
                    playerHand.appendChild(cardInHand);
                    updateHandSpacing();
                    updateHandCount();
                    sendData({ type: 'syncHandCount', count: playerHand.querySelectorAll('.card').length });
                }

                // Continue to NEXT drive check OR resolve the battle
                if (count > 1) {
                    setTimeout(() => driveCheck(count - 1, crit, isOpponentPG), 800);
                } else {
                    console.log("Drive Checks complete. Resolving attack hit...");
                    setTimeout(() => {
                        attackHitCheck(crit, isOpponentPG);
                    }, 500);
                }
            };

            // Wait for targeting to complete before finishing the check
            let waitTime = 0;
            const checkTargeting = setInterval(() => {
                waitTime += 200;
                // Fallback: If stuck in targeting mode for too long (e.g. 15s), force continue
                if (!document.body.classList.contains('targeting-mode') || waitTime > 15000) {
                    clearInterval(checkTargeting);
                    document.body.classList.remove('targeting-mode'); // Safety cleanup
                    setTimeout(finishThisCheck, 1000);
                }
            }, 200);
        }, 500);
    }

    function resolveTrigger(cardData, isDamageCheck = false) {
        let triggerType = cardData.trigger;
        let powerIncrease = triggerType === 'Over' ? 100000000 : 10000;

        alert(`Trigger! ${triggerType} effect activating...`);

        if (triggerType === 'Front') {
            // AUTO-APPLY: Give power increase to all front row units immediately
            document.querySelectorAll('.my-side .front-row .circle .card:not(.opponent-card)').forEach(unit => {
                let currentPower = parseInt(unit.dataset.power);
                unit.dataset.power = currentPower + powerIncrease;

                const powerSpan = unit.querySelector('.card-power');
                if (powerSpan) {
                    const critVal = parseInt(unit.dataset.critical || "1");
                    let displayCritical = critVal > 1 ? `<span style="color:gold;">★${critVal}</span>` : '';
                    powerSpan.innerHTML = `⚔️${unit.dataset.power} ${displayCritical}`;
                }
                sendMoveData(unit);
            });
            alert("ฟรอนท์ทริกเกอร์! แถวหน้าทั้งหมดได้รับพลัง +10,000!");

            // Reset targeting states and exit
            pendingPowerIncrease = 0;
            pendingCriticalIncrease = 0;
            targetingType = null;
            document.body.classList.remove('targeting-mode');
            return;
        }

        if (triggerType === 'Draw') {
            drawCard(true); // Draw for both drive check and damage check
        } else if (triggerType === 'Heal') {
            const myDamage = document.querySelectorAll('.my-side .damage-zone .card').length;
            const oppDamageCardCount = parseInt(oppDamageCountNum?.textContent || "0");

            if (myDamage > 0 && myDamage >= oppDamageCardCount) {
                const damageZone = document.querySelector('.my-side .damage-zone');
                const damageCards = Array.from(damageZone.querySelectorAll('.card'));
                const dropZone = document.querySelector('.my-side .drop-zone');
                if (damageCards.length === 1) {
                    const cardToHeal = damageCards[0];
                    dropZone.appendChild(cardToHeal);
                    cardToHeal.classList.remove('rest');
                    cardToHeal.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;
                    sendMoveData(cardToHeal);
                    updateDropCount();
                    alert("ฮีลทริกเกอร์สำเร็จ!");
                } else {
                    openViewer("เลือกการ์ด 1 ใบจากดาเมจโซนเพื่อฮีล", damageCards);
                    const healPick = (e) => {
                        const clicked = e.target.closest('.card');
                        if (clicked && clicked.parentElement === viewerGrid) {
                            const origId = clicked.dataset.originalId || clicked.id;
                            const actual = damageCards.find(c => c.id === origId);
                            if (actual) {
                                dropZone.appendChild(actual);
                                actual.classList.remove('rest');
                                actual.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;
                                sendMoveData(actual);
                                updateDropCount();
                                alert("Heal successful! (" + actual.dataset.name + ")");
                            }
                            viewerGrid.removeEventListener('click', healPick);
                            zoneViewer.classList.add('hidden');
                        }
                    };
                    viewerGrid.addEventListener('click', healPick);
                }
            } else {
                alert("ฮีลไม่สำเร็จ! (ดาเมจของคุณต้องมากกว่าหรือเท่ากับคู่แข่ง)");
            }
        } else if (triggerType === 'Over') {
            drawCard(true); // Draw 1 card for revealing Over Trigger (Drive or Damage)
            if (!isDamageCheck) {
                // Nation specific OT additional effects (Drive Check only)
                const otName = cardData.name;
                if (otName.includes('Gallmageveld')) {
                    // Dark States: [CONT]: In your turn, all your vanguards get [Power]+10000/[Critical]+1 until the end of the game.
                    window.otDarkStatesActive = true;
                    alert("Dark States OT: All your Vanguards get +10000 Power and +1 Critical for the rest of the game!");
                    updateAllStaticBonuses();
                } else if (otName.includes('Blessfavor')) {
                    // Stoicheia: Draw 1, Front row +10000, Heal 1 (standard heal rules), select 1 unit get +1 Crit
                    window.otStoicheiaActive = true;
                    updateAllStaticBonuses();

                    // Heal 1
                    const myDamage = document.querySelectorAll('.my-side .damage-zone .card').length;
                    const oppDamageCardCount = parseInt(document.getElementById('opp-damage-count-num')?.textContent || "0");
                    if (myDamage > 0 && myDamage >= oppDamageCardCount) {
                        const damageZone = document.querySelector('.my-side .damage-zone');
                        const dmgCards = Array.from(damageZone.querySelectorAll('.card'));
                        const dropZone = document.querySelector('.my-side .drop-zone');
                        if (dmgCards.length === 1) {
                            dropZone.appendChild(dmgCards[0]);
                            dmgCards[0].classList.remove('rest');
                            sendMoveData(dmgCards[0]);
                            updateDropCount();
                            alert("Stoicheia OT: Heal 1 successful!");
                        } else if (dmgCards.length > 1) {
                            openViewer("เลือกการ์ด 1 ใบจากดาเมจโซนเพื่อฮีล (Stoicheia OT)", dmgCards);
                            const healPick = (e) => {
                                const clicked = e.target.closest('.card');
                                if (clicked && clicked.parentElement === viewerGrid) {
                                    const origId = clicked.dataset.originalId || clicked.id;
                                    const actual = dmgCards.find(c => c.id === origId);
                                    if (actual) {
                                        dropZone.appendChild(actual);
                                        actual.classList.remove('rest');
                                        sendMoveData(actual);
                                        updateDropCount();
                                        alert("Stoicheia OT: Heal 1 successful!");
                                    }
                                    viewerGrid.removeEventListener('click', healPick);
                                    zoneViewer.classList.add('hidden');
                                }
                            };
                            viewerGrid.addEventListener('click', healPick);
                        }
                    }

                    // Critical +1 (Step 3 - following power/draw/heal)
                    pendingCriticalIncrease = 1;
                    targetingType = 'critical';
                    alert("Stoicheia OT: Select 1 unit to receive +1 Critical.");
                } else if (otName.includes('Dragveda')) {
                    // Dragon Empire: Stand your VG
                    const vg = document.querySelector('.my-side .circle.vc .card');
                    if (vg) {
                        vg.classList.remove('rest');
                        vg.style.transform = 'none';
                        sendMoveData(vg);
                        alert("โอเวอร์ทริกเกอร์ (Dragon Empire): สแตนด์แวนการ์ดของคุณ!");
                    }
                } else if (otName.includes('Amartinoa')) {
                    window.otKeterActive = true;
                    alert("Keter Sanctuary OT: All your Rear-guards perform drive checks for the rest of the game!");
                } else if (otName.includes('Eldobreath')) {
                    if (!isDamageCheck) {
                        window.otBrandtGateActive = true;
                        alert("Brandt Gate OT: แถวหน้าทั้งหมด พลังและคริติคอล คูณ 2! (จะทำงานเมื่อเลือกเป้าหมาย +100M เสร็จ)");
                    } else {
                        alert("Brandt Gate OT: (Damage Check) No additional effect.");
                    }
                }
            }
        }

        // Standard OT gives 100M Power
        pendingPowerIncrease = powerIncrease;
        document.body.classList.add('targeting-mode');

        if (triggerType === 'Critical') {
            pendingCriticalIncrease = 1;
            targetingType = 'critical';
            alert(`Step 1: Select a unit to receive +1 Critical.`);
        } else if (triggerType === 'Over') {
            const otName = cardData.name || "";
            if (otName.includes('Blessfavor')) {
                // Stoicheia OT gives both 100M and +1 Crit
                pendingCriticalIncrease = 1;
                targetingType = 'both';
                alert(`Select a unit to receive +100M Power and +1 Critical! (Stoicheia OT)`);
            } else {
                targetingType = 'power';
                alert(`Select a unit to receive +100M Power!`);
            }
        } else {
            targetingType = 'power';
            alert(`Select a unit to receive +${powerIncrease} Power.`);
        }

        // After targeting is complete (or if no targeting needed for power/crit), apply Brandt Gate OT
        const checkTargetingComplete = setInterval(() => {
            if (!document.body.classList.contains('targeting-mode')) {
                clearInterval(checkTargetingComplete);
                if (window.otBrandtGateActive && triggerType === 'Over' && cardData.name.includes('Eldobreath') && !isDamageCheck) {
                    document.querySelectorAll('.my-side .front-row .circle .card:not(.opponent-card), .my-side .circle.vc .card:not(.opponent-card)').forEach(unit => {
                        let currentPower = parseInt(unit.dataset.power);
                        let currentCritical = parseInt(unit.dataset.critical || "1");

                        unit.dataset.power = (currentPower * 2).toString();
                        unit.dataset.critical = (currentCritical * 2).toString();
                        syncPowerDisplay(unit);
                        sendMoveData(unit);
                    });
                    alert("Brandt Gate OT: แถวหน้าทั้งหมด พลังและคริติคอล คูณ 2 สำเร็จ!");
                    window.otBrandtGateActive = false; // Consume the effect for this turn
                }
            }
        }, 200);
    }

    async function performAttack(attacker, target) {
        if (document.body.classList.contains('targeting-mode')) {
            alert("กรุณาเลือกเป้าหมายทริกเกอร์ให้เสร็จก่อน!");
            attacker.classList.remove('attacking-glow');
            attackingCard = null;
            return;
        }
        if (currentTurn === 1 && isFirstPlayer) {
            alert("ผู้เล่นที่ได้เริ่มเล่นก่อน ไม่สามารถโจมตีได้ในเทิร์นแรก!");
            attacker.classList.remove('attacking-glow');
            attackingCard = null;
            return;
        }

        // Stricter Targeting: Only allow attacking opponent's units on field (circles)
        const targetParent = target.parentElement;
        const isTargetOnField = targetParent && targetParent.classList.contains('circle');
        const isOpponentCard = target.classList.contains('opponent-card');

        if (!isOpponentCard || !isTargetOnField) {
            alert("Invalid Target! You can only attack opponent's units on the field.");
            return;
        }

        if (isWaitingForGuard) {
            alert("กรุณารอให้ฝั่งคู่แข่งเลือกว่าจะป้องกัน (Guard) ให้เสร็จก่อนจึงจะสามารถโจมตีครั้งต่อไปได้");
            attacker.classList.remove('attacking-glow');
            attackingCard = null;
            return;
        }

        // Restrict to FRONT ROW ONLY
        const zone = targetParent.dataset.zone || '';
        if (zone.includes('back')) {
            alert("Invalid Target! You can only attack front-row units.");
            attacker.classList.remove('attacking-glow');
            attackingCard = null;
            return;
        }

        // --- Launcher Charleen: Cannot attack if <= 5 imprisoned ---
        if (attacker.dataset.name && attacker.dataset.name.includes('Launcher Charleen')) {
            const imprisonedCount = document.querySelectorAll('.my-side .order-zone .card.opponent-card').length;
            if (imprisonedCount <= 5) {
                alert("Launcher Charleen: ไม่สามารถโจมตีได้เนื่องจากการ์ดในคุกของคู่แข่งมีไม่เกิน 5 ใบ!");
                attacker.classList.remove('attacking-glow');
                attackingCard = null;
                return;
            }
        }

        // Booster Logic and Attack Sequence
        const attackerParentCircle = attacker.parentElement;
        const attackerZone = attackerParentCircle.dataset.zone || '';
        const isAttackerBackRow = attackerZone.includes('back');
        const isElderActive = isMagnoliaElderSkillActive();
        const isGrade4Elder = attacker.dataset.name.includes('Magnolia Elder') && parseInt(attacker.dataset.grade) === 4;

        if (isAttackerBackRow && !isElderActive) {
            // Checking for temporary back-column attack ability (Magnolia King skill)
            if (attacker.dataset.canAttackFromBack !== "true") {
                alert("This unit cannot attack from the back row!");
                attacker.classList.remove('attacking-glow');
                attackingCard = null;
                return;
            }
        }

        // Auto-assign Triple Drive to G4 Magnolia Elder
        if (attackerParentCircle.classList.contains('vc') && isGrade4Elder) {
            attacker.dataset.tripleDrive = "true";
        }

        // Use zone name as targetId for better sync in multiplayer/AI
        const targetId = targetParent.dataset.zone;

        if (!await vgConfirm(`Attack ${target.dataset.name} with ${attacker.dataset.name}?`)) {
            attacker.classList.remove('attacking-glow');
            attackingCard = null;
            return;
        }

        // --- Majesty Lord Blaster Attack Skill ---
        if (attacker.dataset.name.includes('Majesty Lord Blaster') && attackerParentCircle.classList.contains('vc') && targetParent.classList.contains('vc')) {
            await handleMajestyAttackSkills(attacker);
        }

        // --- Desire Devil, Fuujo [AUTO](Soul) & Desire Devil, Mucca [AUTO](RC) ---
        if (attackerParentCircle.classList.contains('vc')) {
            // Fuujo (Soul)
            const fuujoInSoul = soulPool.find(c => (c.dataset.name || "").includes('Fuujo'));
            if (fuujoInSoul && attacker.dataset.name.includes('Greedon')) {
                if (await vgConfirm("Desire Devil, Fuujo: [AUTO](Soul) แวนการ์ด Greedon โจมตี [Bind การ์ดนี้] เพื่อให้คู่แข่งต้องคอลการ์ดป้องกัน 2 ใบขึ้นไปพร้อมกัน?")) {
                    const idx = soulPool.indexOf(fuujoInSoul);
                    soulPool.splice(idx, 1);
                    bindPool.push(fuujoInSoul);
                    updateSoulUI();
                    updateCountsUI();
                    
                    // Mark Vanguard for guard restrict
                    attacker.dataset.guardRestrictCount = "2";
                    
                    sendData({ 
                        type: 'moveCard', 
                        cardId: fuujoInSoul.id, 
                        zone: 'bind',
                        side: 'my',
                        syncData: { guardRestrictCount: "2", attackerId: attacker.id }
                    });
                    
                    alert("Fuujo: เปิดใช้งาน Guard Restrict! (คู่แข่งต้องคอล 2 ใบขึ้นไป)");
                }
            }

            // Mousheen (Soul)
            const mousheensInSoul = soulPool.filter(c => (c.dataset.name || "").includes('Mousheen'));
            if (mousheensInSoul.length > 0 && attacker.dataset.name.includes('Greedon') && turnAttackCount === 1) {
                const hasMousheenOnRC = Array.from(document.querySelectorAll('.my-side .circle.rc .card:not(.opponent-card)')).some(c => c.dataset.name.includes('Mousheen'));
                if (!hasMousheenOnRC) {
                    if (await vgConfirm("Desire Devil, Mousheen: [AUTO](Soul) แวนการ์ด Greedon โจมตีครั้งที่ 2 ของเทิร์น และไม่มี Mousheen บนสนาม ต้องการคอลใบนี้ลง (RC) หรือไม่?")) {
                        const callCard = soulPool.splice(soulPool.indexOf(mousheensInSoul[0]), 1)[0];
                        alert("คลิกเลือกช่อง (RC) ที่ว่างอยู่เพื่อคอล Mousheen");
                        document.body.classList.add('targeting-mode');
                        const callListener = (e) => {
                            const circle = e.target.closest('.my-side .circle.rc');
                            if (circle && !circle.querySelector('.card')) {
                                e.stopPropagation();
                                circle.appendChild(callCard);
                                sendMoveData(callCard);
                                updateSoulUI();
                                updateCountsUI();
                                document.body.classList.remove('targeting-mode');
                                document.removeEventListener('click', callListener, true);
                                
                                callCard.classList.remove('rest');
                                callCard.dataset.mousheenImmune = "true";
                                // Ensure buff is applied relative to base power
                                const baseP = parseInt(callCard.dataset.basePower || "13000");
                                const pwr = baseP + 5000;
                                callCard.dataset.power = pwr.toString();
                                callCard.dataset.turnEndBuffPower = "5000";
                                callCard.dataset.turnEndBuffActive = "true";
                                syncPowerDisplay(callCard);
                                alert("คอล Mousheen สำเร็จ! ได้รับพลัง +5000 และเป็นอมตะ (Mousheen Immune) จากสกิลแวนตลอดเทิร์น");
                                applyStaticBonuses(callCard);
                            } else if (circle) {
                                alert("ต้องเลือกช่อง (RC) ที่ว่างเท่านั้น!!");
                            } else {
                                // Prevent stuck in targeting mode if clicking something else
                                if (confirm("คุณต้องการยกเลิกการคอล Mousheen หรือไม่?")) {
                                    document.body.classList.remove('targeting-mode');
                                    document.removeEventListener('click', callListener, true);
                                    soulPool.push(callCard); // return to soul
                                    updateSoulUI();
                                }
                            }
                        };
                        document.addEventListener('click', callListener, true);
                    }
                }
            }
        }

        // --- Knight of Inheritance, Emmeline [AUTO](RC) Trigger ---
        if (attacker.dataset.name.includes('Blaster')) {
            document.querySelectorAll('.my-side .circle .card:not(.opponent-card)').forEach(unit => {
                const z = unit.parentElement.dataset.zone || "";
                if (unit.dataset.name.includes('Emmeline') && z.startsWith('rc')) {
                    unit.dataset.emmelineAtkBonus = (parseInt(unit.dataset.emmelineAtkBonus || "0") + 5000).toString();
                    unit.dataset.power = (parseInt(unit.dataset.power) + 5000).toString();
                    syncPowerDisplay(unit);
                    sendMoveData(unit);
                    alert("Emmeline: ยูนิต 'Blaster' โจมตี พลัง +5000!");
                }
            });
        }

        // --- Ala Dargente [AUTO](RC) Trigger ---
        if (attacker.dataset.name.includes('Avantgarda') && attackerParentCircle.classList.contains('vc')) {
            document.querySelectorAll('.my-side .circle .card:not(.opponent-card)').forEach(unit => {
                const z = unit.parentElement.dataset.zone || "";
                if (unit.dataset.name.includes('Ala Dargente') && z.startsWith('rc')) { // Fix: Ensure Ala Dargente is matched by name
                    unit.dataset.power = (parseInt(unit.dataset.power) + 5000).toString();
                    unit.dataset.turnEndBuffPower = (parseInt(unit.dataset.turnEndBuffPower || "0") + 5000).toString();
                    unit.dataset.turnEndBuffActive = "true";
                    syncPowerDisplay(unit);
                    sendMoveData(unit);
                    alert("Ala Dargente: แวนการ์ด 'Avantgarda' โจมตี ได้รับพลัง +5000 จนจบเทิร์น!");
                }
            });
        }

        // --- Burning Horn Dragon [AUTO](RC) Trigger ---
        if (attacker.dataset.name.includes('Overlord') && attackerParentCircle.classList.contains('vc')) {
            document.querySelectorAll('.my-side .circle .card:not(.opponent-card)').forEach(unit => {
                const z = unit.parentElement.dataset.zone || "";
                if (unit.dataset.name.includes('Burning Horn Dragon') && z.startsWith('rc')) {
                    unit.dataset.power = (parseInt(unit.dataset.power) + 5000).toString();
                    unit.dataset.turnEndBuffPower = (parseInt(unit.dataset.turnEndBuffPower || "0") + 5000).toString();
                    unit.dataset.turnEndBuffActive = "true";
                    syncPowerDisplay(unit);
                    sendMoveData(unit);
                    alert("Burning Horn: แวนการ์ด 'Overlord' โจมตี ได้รับพลัง +5000 จนจบเทิร์น!");
                }
            });
        }

        turnAttackCount++; // Increment attack count for the turn
        console.log(`Attack Count: ${turnAttackCount}`);

        // Trigger Death Winds
        if (attacker.dataset.deathWindsAttackTrigger === "true" && attacker.parentElement.classList.contains('vc')) {
            alert(`${attacker.dataset.name}: ความสามารถ Death Winds ทำงาน! แถวหน้าพลัง +5000`);
            document.querySelectorAll('.my-side .circle .card').forEach(c => {
                const z = c.parentElement.dataset.zone || "";
                if (z === 'vc' || z === 'rc_front_left' || z === 'rc_front_right') {
                    c.dataset.power = (parseInt(c.dataset.power) + 5000).toString();
                    c.dataset.turnEndBuffPower = (parseInt(c.dataset.turnEndBuffPower || "0") + 5000).toString();
                    c.dataset.turnEndBuffActive = "true";
                    syncPowerDisplay(c);
                    sendMoveData(c);
                }
            });
        }

        let basePower = parseInt(attacker.dataset.power);
        let totalPower = basePower;
        let totalCritical = parseInt(attacker.dataset.critical || 1);
        let attackerNameFull = attacker.dataset.name;

        // Check for Booster
        const parentZone = attacker.parentElement.dataset.zone;
        let backZoneName = null;
        if (parentZone === 'rc_front_left') backZoneName = 'rc_back_left';
        else if (parentZone === 'vc') backZoneName = 'rc_back_center';
        else if (parentZone === 'rc_front_right') backZoneName = 'rc_back_right';

        let boosterPower = 0;
        let boosterCardInfo = null;
        if (backZoneName) {
            const backCircle = document.querySelector(`.my-side .circle[data-zone="${backZoneName}"]`);
            if (backCircle) {
                const card = backCircle.querySelector('.card:not(.opponent-card)');
                if (card && !card.classList.contains('rest')) {
                    const grade = parseInt(card.dataset.grade);
                    const canBoost = grade === 0 || grade === 1 || card.dataset.canBoost === "true";
                    if (canBoost) { // Grade 0, 1 or G2 with Boost
                        if (await vgConfirm(`Do you want to Boost with your backrow ${card.dataset.name}? (+${card.dataset.power} Power)`)) {
                            card.classList.add('rest');
                            sendMoveData(card);
                            boosterPower = parseInt(card.dataset.power);

                            // --- Ordeal Dragon Skill ---
                            if (card.dataset.name.includes('Ordeal Dragon') && attacker.dataset.name.includes('Blaster')) {
                                boosterPower += 5000;
                                alert("Ordeal Dragon: บูสต์ยูนิท 'Blaster' พลัง +5000!");
                            }

                            if (card.dataset.name.includes('Hanada Halfway') && strategyPutToOrderZoneThisTurn) {
                                // Removed redundant Hanada calculation here, it's handled below
                                // boosterPower += 2000;
                                // alert(`Hanada Halfway: พลัง +2000 จนจบการต่อสู้!`);
                                if (backZoneName === 'rc_back_center') {
                                    counterCharge(1);
                                    alert("Hanada Halfway (แถวหลังสุดกลาง): [Counter-Charge 1]!");
                                }
                            }

                            totalPower += boosterPower;
                            attackerNameFull = `${attacker.dataset.name} (Boosted by ${card.dataset.name})`;
                            boosterCardInfo = { id: card.id, name: card.dataset.name, zone: backZoneName };

                            if (isFinalRush && parentZone === 'vc' && card.dataset.name.includes('Mabel')) {
                                if (await vgConfirm("Mabel: [AUTO] เมื่อบูสต์แวนการ์ด ในสถานะ Final Rush [CB1] ทำให้แวนการ์ดได้รับ Triple Drive จนจบเทิร์น?")) {
                                    if (payCounterBlast(1)) {
                                        attacker.dataset.tripleDrive = "true";
                                        alert("Mabel: แวนการ์ดของคุณได้รับ Triple Drive! (เช็คไดร์ฟ 3 ใบ)");
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // --- Blue Deathster, Hanada Halfway [AUTO] ---
        if (boosterCardInfo && boosterCardInfo.name.includes('Hanada Halfway')) {
            if (strategyPutToOrderZoneThisTurn) {
                let bonusPwr = 2000;
                totalPower += bonusPwr;
                let ccMsg = "";
                if (boosterCardInfo.zone === 'rc_back_center') {
                    // Counter-Charge already handled above if it was the center back row
                    // ccMsg = " และทำการ [Counter-Charge 1]";
                }
                alert(`Hanada Halfway: พลังบูสต์เพิ่ม +2000${ccMsg}!`);
            }
        }

        // --- Youthberk Unit Attack Skills ---
        const vNode = document.querySelector('.my-side .circle.vc .card');
        const vName = vNode ? vNode.dataset.name : "";
        const uName = attacker.dataset.name;

        if (uName.includes('Determined to Break Away')) {
            totalPower += 2000;
            alert("Determined to Break Away: [CONT] พลัง +2000 ระหว่างการต่อสู้!");
        }

        // --- Schneizal [AUTO](RC): When this unit attacks a VG, if your VG was placed this turn by riding from G3, VG gets +5000 ---
        if (uName.includes('Schneizal') && parentZone.startsWith('rc')) {
            const target = document.querySelector('.opponent-side .circle.vc .card');
            if (target && attacker.parentElement && window.rodeFromG3ThisTurn) {
                const vgCard = document.querySelector('.my-side .circle.vc .card');
                if (vgCard) {
                    vgCard.dataset.power = (parseInt(vgCard.dataset.power) + 5000).toString();
                    vgCard.dataset.turnEndBuffPower = (parseInt(vgCard.dataset.turnEndBuffPower || "0") + 5000).toString();
                    vgCard.dataset.turnEndBuffActive = "true";
                    syncPowerDisplay(vgCard);
                    sendMoveData(vgCard);
                    alert("Schneizal: [AUTO](RC) แวนการ์ดถูกไรด์จาก G3 เทิร์นนี้! VG พลัง +5000!");
                }
            }
        }

        // --- Dolbraig [AUTO](RC): When attacking G3+ unit, [SB1 RevolForm] power +10000 ---
        if (uName.includes('Dolbraig') && parentZone.startsWith('rc')) {
            const targetCard = document.querySelector('.opponent-side .circle.vc .card') ||
                document.querySelector('.opponent-side .circle.rc .card');
            const targetGrade = targetCard ? parseInt(targetCard.dataset.grade || "0") : 0;
            if (targetGrade >= 3) {
                const revolSoulIdx = soulPool.findIndex(c => c.dataset.name.includes('RevolForm'));
                if (revolSoulIdx !== -1) {
                    if (await vgConfirm("Dolbraig: [AUTO](RC) โจมตียูนิท G3+ [SB1 การ์ด RevolForm] พลัง +10000?")) {
                        const soulCard = soulPool.splice(revolSoulIdx, 1)[0];
                        const dropZone = document.querySelector('.my-side .drop-zone');
                        dropZone.appendChild(soulCard);
                        sendMoveData(soulCard);
                        updateSoulUI();
                        updateDropCount();
                        totalPower += 10000;
                        alert("Dolbraig: SB RevolForm! พลัง +10000!");
                    }
                }
            }
        }


        // --- Knight of Inheritance, Emmeline Skill ---
        if (attacker.dataset.name.includes('Emmeline')) {
            const vgNode = document.querySelector('.my-side .circle.vc .card');
            if (vgNode && vgNode.dataset.name.includes('Blaster')) {
                totalPower += 5000;
                alert("Emmeline: แวนการ์ดเป็น 'Blaster' พลัง +5000!");
            }
        }

        // --- Nirvana Jheva [AUTO](VC) ---
        if (isMyTurn && attacker.dataset.name.includes('Nirvana Jheva') && parentZone === 'vc') {
            if (await vgConfirm(`Nirvana Jheva: เมื่อโจมตี [CB1] เลือก Stand เรียร์การ์ดสถานะ [XoverDress] 1 ใบ?`)) {
                if (payCounterBlast(1)) {
                    alert("เลือกเรียร์การ์ดสถานะ X-overDress (Vairina) 1 ใบเพื่อ Stand");
                    document.body.classList.add('targeting-mode');
                    const standListener = (e) => {
                        const targetRG = e.target.closest('.circle.rc .card:not(.opponent-card)');
                        if (targetRG && (targetRG.dataset.isOverDress === "true" || targetRG.dataset.isXoverDress === "true" || targetRG.dataset.name.includes('Vairina'))) {
                            e.stopPropagation();
                            targetRG.classList.remove('rest');
                            sendMoveData(targetRG);
                            alert(`${targetRG.dataset.name} Stand!`);
                            document.body.classList.remove('targeting-mode');
                            document.removeEventListener('click', standListener, true);
                        }
                    };
                    document.addEventListener('click', standListener, true);
                }
            }
        }

        // --- Graillumirror [AUTO](RC) Support ---
        if (isMyTurn && attacker.dataset.name.includes('Nirvana') && parentZone === 'vc') {
            const rgs = document.querySelectorAll('.my-side .circle.rc .card:not(.opponent-card)');
            for (const grail of rgs) {
                if (grail.dataset.name.includes('Graillumirror') && !grail.classList.contains('rest')) {
                    if (await vgConfirm("Graillumirror (RC): เมื่อแวนการ์ด Nirvana โจมตี [CB1] เพื่อ Stand ยูนิท overDress/XoverDress?")) {
                        if (payCounterBlast(1)) {
                            alert("เลือกยูนิต overDress หรือ XoverDress เพื่อ Stand");
                            document.body.classList.add('targeting-mode');
                            const grailStandListener = (e) => {
                                const targetRG = e.target.closest('.circle.rc .card:not(.opponent-card)');
                                if (targetRG && (targetRG.dataset.isOverDress === "true" || targetRG.dataset.isXoverDress === "true")) {
                                    e.stopPropagation();
                                    targetRG.classList.remove('rest');
                                    targetRG.dataset.power = (parseInt(targetRG.dataset.power) + 5000).toString();
                                    targetRG.dataset.turnEndBuffPower = (parseInt(targetRG.dataset.turnEndBuffPower || "0") + 5000).toString();
                                    targetRG.dataset.turnEndBuffActive = "true";
                                    syncPowerDisplay(targetRG);
                                    sendMoveData(targetRG);
                                    alert(`${targetRG.dataset.name} Stand! และได้รับพลัง +5000 จนจบเทิร์น`);
                                    document.body.classList.remove('targeting-mode');
                                    document.removeEventListener('click', grailStandListener, true);
                                }
                            };
                            document.addEventListener('click', grailStandListener, true);
                        }
                    }
                    break; // Only one Graillumirror activation for simplicity or as per rule
                }
            }
        }

        if (isMyTurn) {
            const isTargetVanguard = target.parentElement.classList.contains('vc');

            // --- Alpin [AUTO](RC) ---
            if (attacker.dataset.name.includes('Alpin') && isTargetVanguard) {
                const vg = document.querySelector('.my-side .circle.vc .card');
                if (vg && vg.dataset.name.includes('Magnolia')) {
                    const g2PlusCount = Array.from(document.querySelectorAll('.my-side .circle .card:not(.opponent-card)'))
                        .filter(u => parseInt(u.dataset.grade) >= 2).length;
                    const powerBonus = Math.floor(g2PlusCount / 2) * 5000;
                    if (powerBonus > 0) {
                        attacker.dataset.power = parseInt(attacker.dataset.power) + powerBonus;
                        totalPower += powerBonus;
                        alert(`Alpin: Power +${powerBonus} (G2+ units: ${g2PlusCount})`);
                        if (powerBonus >= 10000) attacker.dataset.alpinBindReady = "true";
                        syncPowerDisplay(attacker);
                    }
                }
            }

            // --- Goildoat [AUTO](RC) Back Row ---
            if (attacker.dataset.name.includes('Goildoat') && isAttackerBackRow) {
                attacker.dataset.power = parseInt(attacker.dataset.power) + 10000;
                totalPower += 10000;
                alert("Goildoat: [Back Row (RC)] Power +10000!");
                if (attackerParentCircle.dataset.zone === 'rc_back_center') attacker.dataset.goildoatRetireReady = "true";
                syncPowerDisplay(attacker);
            }

            // --- Gabregg [AUTO](RC) ---
            // Triggered when OTHER unit in same column attacks.
            const columnZones = {
                'rc_front_left': 'rc_back_left', 'rc_back_left': 'rc_front_left',
                'rc_front_right': 'rc_back_right', 'rc_back_right': 'rc_front_right',
                'vc': 'rc_back_center', 'rc_back_center': 'vc'
            };
            const otherZoneInCol = columnZones[parentZone];
            if (otherZoneInCol) {
                const otherCircle = document.querySelector(`.my-side .circle[data-zone="${otherZoneInCol}"]`);
                if (otherCircle) {
                    const gabregg = otherCircle.querySelector('.card:not(.opponent-card)');
                    if (gabregg && gabregg.dataset.name.includes('Gabregg')) {
                        if (await vgConfirm(`Gabregg: ยูนิทในแถวเดียวกันโจมตี จ่าย [SB1] เพื่อรับ Power+10000 และมอบ Guard Restrict?`)) {
                            if (await paySoulBlast(1)) {
                                gabregg.dataset.power = parseInt(gabregg.dataset.power) + 10000;
                                alert("Gabregg: Power +10000 applied!");
                                syncPowerDisplay(gabregg);

                                // Flag Gabregg to apply guard restrict when HE attacks later
                                gabregg.dataset.gabrestrict = "true";
                            } else {
                                alert("โซลไม่พอ!");
                            }
                        }
                    }
                }
            }

            // If Gabregg himself is attacking and has the restrict flag
            if (attacker.dataset.name.includes('Gabregg') && attacker.dataset.gabrestrict === "true") {
                // Get opponent's RG grades
                const oppRGs = document.querySelectorAll('.opponent-side .circle.rc .card');
                const grades = Array.from(oppRGs).map(c => parseInt(c.dataset.grade));
                if (grades.length > 0) {
                    attacker.dataset.guardRestrictGrades = JSON.stringify([...new Set(grades)]);
                    alert(`Gabregg: Guard Restrict! คู่แข่งไม่สามารถคอลเกรด ${JSON.parse(attacker.dataset.guardRestrictGrades).join(', ')} จากบนมือได้`);
                }
            }

            // --- Garou Vairina [AUTO](RC) ---
            if (attacker.dataset.name.includes('Garou Vairina')) {
                if (attacker.dataset.isXoverDress === "true") {
                    totalPower += 10000; // Static bonus should already be added by applyStaticBonuses, but let's be sure or just log it
                    // The static bonus is added in applyStaticBonuses, so totalPower is handles by syncPowerDisplay
                    attacker.dataset.guardRestrictCount = "2";
                    alert("Garou Vairina: X-overDress Attack! Guard Restrict: 2+ cards from hand.");
                }
            }


            // --- Mirrors Vairina [AUTO](RC) ---
            if (attacker.dataset.name.includes('Mirrors Vairina')) {
                if (attacker.dataset.isXoverDress === "true") {
                    attacker.dataset.power = parseInt(attacker.dataset.power) + 10000;
                    attacker.dataset.mirrorsPowerAdded = "true";
                    totalPower += 10000;
                    alert("Mirrors Vairina: X-overDress Attack! Power +10000");
                    syncPowerDisplay(attacker);

                    const vairinasInDress = (attacker.originalDress || []).filter(d => d.name.includes("Vairina"));
                    if (vairinasInDress.length > 0) {
                        if (await vgConfirm("Mirrors Vairina: [COST][ส่ง Vairina ที่ซ้อนอยู่ลงดรอบ] เพื่อจั่วการ์ด 1 ใบ หรือ CC 1?")) {
                            openViewer("Choose Vairina to Drop", vairinasInDress);
                            const selDrop = (ev) => {
                                const clicked = ev.target.closest('.card');
                                if (clicked && clicked.parentElement === viewerGrid) {
                                    viewerGrid.removeEventListener('click', selDrop);
                                    zoneViewer.classList.add('hidden');

                                    const cIdx = attacker.originalDress.findIndex(d => d.name === clicked.dataset.name);
                                    const dropped = attacker.originalDress.splice(cIdx, 1)[0];

                                    const dropZone = document.querySelector('.my-side .drop-zone');
                                    const dropElem = createCardElement(dropped);
                                    dropZone.appendChild(dropElem);
                                    sendMoveData(dropElem);
                                    updateDropCount();
                                    alert(`ทิ้ง ${dropped.name} แล้ว!`);

                                    if (confirm("เลือก OK สำหรับ 'จั่วการ์ด 1 ใบ' หรือ Cancel สำหรับ 'Counter Charge 1'")) {
                                        drawCard(true);
                                    } else {
                                        counterCharge(1);
                                    }
                                }
                            };
                            viewerGrid.addEventListener('click', selDrop);
                        }
                    }
                }
            }

            // Existing attack-time skills...
            if (isFinalRush && attacker.dataset.name.toLowerCase().includes('megan')) {
                // Every time she attacks, she gets +10000 until end of turn. Stacks.
                attacker.dataset.power = parseInt(attacker.dataset.power) + 10000;
                totalPower += 10000;
                alert(`Megan: [AUTO] Final Rush! Power +10000 applied (Total: ${attacker.dataset.power})`);
                syncPowerDisplay(attacker);
            }

            // Eden Critical check [CONT]
            if (isFinalRush && attacker.dataset.name.includes('Eden')) {
                if (attacker.dataset.stoodByEffect === "true") {
                    totalCritical += 1;
                    if (!attacker.dataset.edenCritApplied) {
                        attacker.dataset.critical = parseInt(attacker.dataset.critical) + 1;
                        attacker.dataset.edenCritApplied = "true";
                    }
                    alert("Eden: [CONT] Restood bonus! Critical +1 applied.");
                }
                sendMoveData(attacker);
            }

            // Magnolia Giunosla [AUTO]
            if (attacker.dataset.name.includes('Giunosla') && isAttackerBackRow) {
                if (await vgConfirm("Giunosla: [AUTO] เมื่อยูนิทนี้โจมตีจากแถวหลัง [CB1] มอบพลังทั้งหมดของยูนิทนี้ให้เรียร์การ์ดใบอื่น?")) {
                    if (payCounterBlast(1)) {
                        promptGiunoslaPowerTransfer(attacker);
                    }
                }
            }

            // --- Julian [AUTO](RC)[1/turn] ---
            if (isMyTurn && attacker.dataset.name.includes('Julian') && targetParent.classList.contains('vc')) {
                if (attacker.dataset.julianUsed !== "true") {
                    if (await vgConfirm("Julian: [AUTO] เมื่อโจมตีแวนการ์ด [CB1] เพื่อรับพลังและ SC ตามดาเมจ?")) {
                        if (payCounterBlast(1)) {
                            attacker.dataset.julianUsed = "true";
                            const damageCount = document.querySelectorAll('.my-side .damage-zone .card').length;
                            const pwrBonus = damageCount * 2000;
                            attacker.dataset.power = parseInt(attacker.dataset.power) + pwrBonus;
                            totalPower += pwrBonus;
                            syncPowerDisplay(attacker);
                            alert(`Julian: Power +${pwrBonus} จนจบเทิร์น!`);

                            const vg = document.querySelector('.my-side .circle.vc .card');
                            if (vg && vg.dataset.name.includes('Bruce')) {
                                const scToPerform = Math.floor(damageCount / 2);
                                if (scToPerform > 0) {
                                    alert(`Julian: แวนการ์ดคือ Bruce! Soul Charge ${scToPerform} และเลือกคอลสูงสุด ${scToPerform} ใบ!`);
                                    soulCharge(scToPerform);
                                    promptCallMultipleFromSoul(scToPerform, "RC ที่ว่างอยู่");
                                }
                            }
                        }
                    }
                }
            }

            attacker.classList.add('rest');
            sendMoveData(attacker);

            const isVanguardAttacker = attacker.parentElement.classList.contains('vc');

            // --- Avantgarda Attacker / Booster Skills ---
            if (strategyActivatedThisTurn) {
                // Findanis (CONT) - Handled in applyStaticBonuses for visibility
                // Stelvane AUTO power bonus removed per user request
            }

            // --- Dragonic Overlord [CONT](VC/RC) Guard Restrict ---
            if (attacker.dataset.name.includes('Dragonic Overlord') && !attacker.dataset.name.includes('the End') && !isTargetVanguard) {
                attacker.dataset.guardRestrictGrades = JSON.stringify(["0", "1", "2", "3", "4", "5"]);
                alert("Dragonic Overlord: [CONT] เมื่อโจมตีใส่เรียร์การ์ด คู่แข่งไม่สามารถคอลการ์ดจากมือลง (GC) ได้!");
            }

            // --- Ardor Hatchet Dragon [AUTO](RC) Trigger ---
            if (attacker.dataset.name.includes('Ardor Hatchet Dragon') && attackerParentCircle.classList.contains('rc')) {
                const vgCard = document.querySelector('.my-side .circle.vc .card');
                if (vgCard && vgCard.dataset.name.includes('Overlord') && isTargetVanguard) {
                    attacker.dataset.power = (parseInt(attacker.dataset.power) + 5000).toString();
                    attacker.dataset.turnEndBuffPower = (parseInt(attacker.dataset.turnEndBuffPower || "0") + 5000).toString();
                    attacker.dataset.turnEndBuffActive = "true";
                    syncPowerDisplay(attacker);
                    sendMoveData(attacker);
                    alert("Ardor Hatchet: แวนการ์ดชื่อ 'Overlord' และตีเข้า VG ยูนิตนี้ได้พลัง +5000 จนจบเทิร์น");
                }
            }

            const attackData = {
                attackerId: attacker.id,
                attackerName: attackerNameFull,
                boostPower: boosterPower,
                totalPower: totalPower,
                totalCritical: totalCritical,
                targetId: targetId,
                targetName: target.dataset.name,
                isVanguardAttacker: isVanguardAttacker,
                isTargetVanguard: isTargetVanguard,
                vanguardGrade: attacker.dataset.grade,
                driveCount: parseInt(attacker.dataset.drive || (isVanguardAttacker ? (parseInt(attacker.dataset.grade) >= 4 ? "3" : (parseInt(attacker.dataset.grade) >= 3 ? "2" : "1")) : (attacker.dataset.baurDriveCheck === "true" ? "1" : "0"))),
                boosterId: boosterCardInfo ? boosterCardInfo.id : null,
                boosterName: boosterCardInfo ? boosterCardInfo.name : null,
                tripleDrive: attacker.dataset.tripleDrive === "true" || (parseInt(attacker.dataset.grade) === 4),
                majestyDriveBuff: attacker.dataset.majestyDriveBuff === "true",
                baurDriveCheck: attacker.dataset.baurDriveCheck === "true",
                isMultiAttack: attacker.dataset.bojalcornActive === "true" && isAttackerBackRow,
                guardRestrictGrades: attacker.dataset.guardRestrictGrades ? JSON.parse(attacker.dataset.guardRestrictGrades) : null,
                guardRestrictCount: Math.max(parseInt(attacker.dataset.guardRestrictCount || "0"), window.activeGuardRestrictCount || 0, (attacker.dataset.name.includes('Penetrate Aquas') && document.querySelectorAll('.my-side .order-zone .card.opponent-card').length >= 2) ? 2 : 0),
                bomberNoIntercept: isVanguardAttacker && bomberDustingNoIntercept,
                bomberNoBlitz: (isVanguardAttacker && bomberDustingNoBlitz) || attacker.dataset.name.includes('Launcher Charleen'),
                charleenRestrictNormal: attacker.dataset.name.includes('Launcher Charleen')
            };

            // Reset Bojalcorn multi-attack flag if it was active
            if (attacker.dataset.name && (attacker.dataset.name.includes('Bojalcorn') || attacker.dataset.name.includes('Magnolia'))) {
                attacker.dataset.bojalcornActive = "false";
            }

            // --- Baur Vairina Attack Skill ---
            const isBaur = attacker.dataset.name && attacker.dataset.name.includes('Baur Vairina');
            if (isBaur && attacker.dataset.isXoverDress === "true" && !attacker.dataset.baurDriveUsed) {
                if (await vgConfirm("Baur Vairina: [CB1] เพื่อได้รับ Drive +1?")) {
                    if (payCounterBlast(1)) {
                        attacker.dataset.baurDriveCheck = "true";
                        attacker.dataset.baurDriveUsed = "true";
                        syncPowerDisplay(attacker);
                        sendMoveData(attacker);
                        alert("Baur Vairina: ได้รับ Drive +1 สำหรับการต่อสู้นี้!");
                        // Update attack data drive count
                        attackData.driveCount = 1;
                        attackData.baurDriveCheck = true;
                    }
                }
            }

            // Bruce Attack Ability Check
            const isBruce = attacker.dataset.name && (attacker.dataset.name.includes('Viamance') || attacker.dataset.name.includes('Bruce'));
            if (isVanguardAttacker && isFinalBurst && isBruce) {
                setTimeout(async () => {
                    if (await vgConfirm("FINAL BURST: Cost CB 1 to restand a column and give +5000 Power?")) {
                        if (payCounterBlast(1)) {
                            showColumnSelection(col => {
                                if (col) restandColumn(col);
                            });
                        }
                    }
                }, 500);
            }

            sendData({
                type: 'declareAttack',
                ...attackData
            });

            const statusText = document.getElementById('game-status-text');
            if (statusText) statusText.textContent = "Waiting for opponent to guard...";
            isWaitingForGuard = true;
        }
    }

    async function validateAndMoveCard(card, zone) {
        if (!card || !zone) return false;

        const oldParent = card.parentElement;
        const isFromHand = oldParent && oldParent.dataset.zone === 'hand';
        const isFromField = oldParent && oldParent.classList.contains('circle');
        const isFromVC = oldParent && oldParent.classList.contains('vc');
        const isFromGC = oldParent && (oldParent.dataset.zone === 'gc_player' || oldParent.id === 'shared-gc');
        const isHandZone = zone.dataset.zone === 'hand' || zone.id === 'player-hand' || zone.classList.contains('player-hand');

        // Allow returning cards from GC to Hand during defense
        if (isFromGC && isHandZone && isGuarding) {
            zone.appendChild(card);
            updateHandCount();
            updateGCShield();
            updateHandSpacing();
            sendMoveData(card);
            return true;
        }

        if (isFromHand) {
            card.dataset.fromHand = "true";
        } else if (isFromField) {
            card.dataset.fromHand = "false";
        }

        // 0. Vanguard Movement Restriction
        if (isFromVC && (zone.classList.contains('rc') || zone.dataset.zone === 'hand' || zone.classList.contains('drop-zone'))) {
            alert("แวนการ์ดไม่สามารถย้ายไปช่องเรียร์การ์ด, บนมือ หรือช่องดรอปได้!");
            return false;
        }

        // 1. Basic Boundary Checks
        if (isFromHand) {
            const isMySide = zone.closest('.my-side');
            const isSharedGC = zone.id === 'shared-gc';
            const isVanguard = zone.classList.contains('vc');
            const isRearguard = zone.classList.contains('rc');
            const isDropZone = zone.classList.contains('drop-zone');
            const isOrderZone = zone.classList.contains('order-zone');
            const allowed = (isMySide && (isVanguard || isRearguard || isDropZone || isOrderZone)) || isSharedGC;

            if (isOrderZone) {
               if (card.dataset.cardType === 'Set Order' || (card.dataset.skill && (card.dataset.skill.includes('[Order]') || card.dataset.skill.includes('Set Order')))) {
                   playOrder(card);
                   return false; 
               } else {
                   alert("เฉพาะการ์ด Order เท่านั้นที่วางในช่อง Order Zone ได้!");
                   return false;
               }
            }


            if (isDropZone && card.dataset.skill && card.dataset.skill.includes('[Order]')) {
                orderPlayedThisTurn = true;
                updateAllStaticBonuses();
            }

            if (!allowed) {
                alert("การเคลื่อนย้ายไม่ถูกต้อง! การ์ดบนมือวางได้เฉพาะบนสนามของคุณ, ช่องดรอป หรือช่องการ์เดียนเท่านั้น");
                return false;
            }
        }

        // 2. Guarding Check
        if (zone.dataset.zone === 'gc_player' || zone.id === 'shared-gc') {
            if (!isGuarding) {
                alert("คุณสามารถวางการ์ดลงช่องการ์เดียนได้เฉพาะตอนป้องกันการโจมตีเท่านั้น!");
                return false;
            }

            if (isFromField && !isFromHand) {
                const isGrade2FrontRow = card.dataset.grade == "2" && oldParent && oldParent.dataset.zone && oldParent.dataset.zone.startsWith('rc_front_');
                const isElderActive = isMagnoliaElderSkillActive();
                const vg = document.querySelector('.my-side .circle.vc .card');
                const isCordielaGuard = card.dataset.name.includes('Cordiela') && vg && vg.dataset.name.includes('Majesty');
                const isInterceptable = isGrade2FrontRow || (isElderActive && !isFromVC) || isCordielaGuard;
                if (!isInterceptable) {
                    alert("เฉพาะเรียร์การ์ดเกรด 2 ในแถวหน้า (หรือยูนิทที่มีสกิล Intercept) เท่านั้นที่สามารถ Intercept ได้!");
                    return false;
                }
            }

            // --- Guard Restrict Check ---
            if (window.currentIncomingAttack && window.currentIncomingAttack.guardRestrictGrades) {
                const cardGrade = parseInt(card.dataset.grade);
                if (isFromHand && window.currentIncomingAttack.guardRestrictGrades.includes(cardGrade)) {
                    alert(`GUARD RESTRICT! คุณไม่สามารถคอลยูนิวเกรด ${cardGrade} จากบนมือลง G ได้!`);
                    return false;
                }
            }

            // --- Launcher Charleen Guard Restrict (Normal Units from Hand) ---
            if (window.currentIncomingAttack && window.currentIncomingAttack.charleenRestrictNormal) {
                if (isFromHand && (!card.dataset.trigger || card.dataset.trigger === "")) {
                    alert("ผลของ Launcher Charleen! ไม่สามารถนำ 'นอร์มอลยูนิท' จากมือป้องกันได้ (สามารถนำทริกเกอร์ป้องกันเท่านั้น)!");
                    return false;
                }
            }

            // Bomber Strategy Intercept Restrict
            if (window.currentIncomingAttack && window.currentIncomingAttack.bomberNoIntercept) {
                if (isFromField && !isFromHand) {
                    alert("ผลของ Bomber Strategy Dusting! คุณไม่สามารถทำการ Intercept ได้!");
                    return false;
                }
            }

            // Bomber Strategy Blitz Order Restrict is handled in playOrder

            // --- Trigger Shield Buff ---
            const oppVG = document.querySelector('.opponent-side .circle.vc .card');
            const oppVGGrade = oppVG ? parseInt(oppVG.dataset.grade || "0") : 0;
            if (oppVGGrade >= 3) {
                const triggerType = card.dataset.trigger || "";
                let shieldBonus = 0;
                if (triggerType === "Draw") {
                    shieldBonus = 5000;
                    card.dataset.shield = "10000";
                } else if (triggerType === "Front") {
                    shieldBonus = 5000;
                    card.dataset.shield = "20000";
                }

                if (shieldBonus > 0) {
                    const shieldSpan = card.querySelector('.card-shield');
                    if (shieldSpan) shieldSpan.innerHTML = `🛡️${card.dataset.shield}`;
                    alert(`${triggerType} Trigger: Shield +${shieldBonus}! (กลายเป็น ${card.dataset.shield})`);
                }
            }

            const isPG = card.dataset.isPG === "true" || card.dataset.name.includes('(PG)');
            
            // --- Derii Violet [AUTO](GC) ---
            if (card.dataset.name && card.dataset.name.includes('Derii Violet')) {
                const imprisonedCount = document.querySelectorAll('.my-side .order-zone .card.opponent-card').length;
                if (imprisonedCount >= 1) {
                    if (await vgConfirm("Derii Violet: [SB1] เลือกยูนิท 1 ใบ จะไม่ถูก Hit โดยแวนเกรด 2 หริอต่ำกว่าจนจบการต่อสู้?")) {
                        if (await paySoulBlast(1)) {
                            // The unit being attacked is in currentAttackData.targetId
                            const targetId = window.currentIncomingAttack ? window.currentIncomingAttack.targetId : null;
                            if (targetId) {
                                const targetCircle = document.querySelector(`.my-side .circle[data-zone="${targetId}"], .my-side .circle#${targetId}`);
                                const targetUnit = targetCircle ? targetCircle.querySelector('.card') : null;
                                if (targetUnit) {
                                    targetUnit.dataset.cannotBeHitByG2Lower = "true";
                                    alert(`สกิล Derii Violet: ${targetUnit.dataset.name} จะไม่ถูก Hit โดยแวนเกรด 2 หรือต่ำกว่าในการต่อสู้นี้!`);
                                }
                            }
                        }
                    }
                }
            }

            if (isPG) {
                const cardsInHand = Array.from(playerHand.querySelectorAll('.card'));
                // Filter out the current card being moved to GC if it's from hand
                const otherCardsInHand = cardsInHand.filter(c => c.id !== card.id);

                if (otherCardsInHand.length >= 1) { // If there are other cards left in hand
                    if (await vgConfirm("Perfect Guard: Discard 1 card from hand as cost?")) {
                        alert("Select a card from your hand to discard.");
                        document.body.classList.add('targeting-mode');

                        const pgDiscardListener = (e) => {
                            const discardTarget = e.target.closest('.card');
                            if (discardTarget && discardTarget.parentElement && discardTarget.parentElement.dataset.zone === 'hand' && discardTarget.id !== card.id) {
                                e.stopPropagation();
                                const dropZone = document.querySelector('.my-side .drop-zone');
                                dropZone.appendChild(discardTarget);
                                sendMoveData(discardTarget);
                                updateHandCount();
                                updateDropCount();
                                document.body.classList.remove('targeting-mode');
                                document.removeEventListener('click', pgDiscardListener, true);
                                alert("Cost paid: Card discarded.");
                            } else if (discardTarget && discardTarget.id === card.id) {
                                alert("You cannot discard the card you are using to guard!");
                            }
                        };
                        document.addEventListener('click', pgDiscardListener, true);
                    } else {
                        alert("Cost not paid. Perfect Guard will not activate!");
                        // If cost not paid, prevent it from being a PG
                        card.dataset.isPG = "false";
                    }
                } else {
                    alert("No other cards in hand to pay Perfect Guard cost. PG will not activate!");
                    card.dataset.isPG = "false";
                }
            }
            // Move card and cleanup
            zone.appendChild(card);
            card.classList.remove('rest');
            card.style.transform = 'none';
            if (oldParent) updateAllStaticBonuses();
            updateAllStaticBonuses();
            sendMoveData(card);
            updateHandCount();
            updateDropCount();
            updateGCShield();
            return true;
        }

        // 3. Turn Check
        if (!isMyTurn) return false;
        const currentPhase = phases[currentPhaseIndex];

        // 3a. Block removing Set Order cards from Order Zone (must be before any zone-specific logic)
        if (oldParent && oldParent.classList.contains('order-zone') && card.dataset.skill && card.dataset.skill.includes('[Set Order]')) {
            alert("ไม่สามารถย้าย Set Order ออกจาก Order Zone ได้ นอกจากสกิลตัวอื่น!");
            return false;
        }

        // 4. Circle Validation (Ride/Call/Move)
        if (zone.classList.contains('circle')) {
            const cardGrade = card.getEffectiveGrade ? card.getEffectiveGrade() : parseInt(card.dataset.grade);
            const vanguard = document.querySelector('.my-side .circle.vc .card');
            const vanguardGrade = vanguard ? parseInt(vanguard.dataset.grade) : 0;

            // Prevent Orders from being called to field
            if (card.dataset.skill && card.dataset.skill.includes('[Order]')) {
                alert("การ์ด Order ไม่สามารถคอลลงช่องแวนการ์ดหรือเรียร์การ์ดได้!");
                return false;
            }

            // 4a. Move to Vanguard Circle (RIDE)
            if (zone.classList.contains('vc')) {
                if (isFromField) {
                    alert("The Vanguard cannot be moved or swapped with Rear-guards!");
                    return false;
                }
                if (currentPhase !== 'ride') { alert("Only Ride during Ride Phase!"); return false; }
                if (hasRiddenThisTurn) { alert("Only Ride once per turn!"); return false; }

                // Allow exact same grade if it's G3 or G4 (Persona Ride or G4 re-ride)
                const isSameGradeAllowed = cardGrade >= 3 && cardGrade === vanguardGrade;

                // --- Greedon Masques Ride Constraint ---
                if (card.dataset.name.includes("Masques") && card.dataset.name.includes("Greedon")) {
                    if (vanguardGrade !== 3 || !vanguard.dataset.name.includes("Greedon")) {
                        alert("Greedon Masques สามารถไรด์ทับได้เฉพาะเกรด 3 ที่ติดชื่อ 'Greedon' เท่านั้น!");
                        return false;
                    }
                }

                if (cardGrade !== vanguardGrade + 1 && !isSameGradeAllowed && !(cardGrade === 4 && vanguardGrade === 3)) {
                    alert(`ไม่สามารถไรด์เกรด ${cardGrade} ทับเกรด ${vanguardGrade} ได้!`);
                    return false;
                }

                // Ride success
                zone.querySelectorAll('.card').forEach(c => {
                    soulPool.push(c);
                    sendMoveData(c);
                });
                zone.innerHTML = '';
                zone.appendChild(card);
                hasRiddenThisTurn = true;
                // Track if rode from G3 (for Schneizal 2nd ability)
                if (vanguardGrade >= 3) {
                    window.rodeFromG3ThisTurn = true;
                }
                updateSoulUI();

                const vanguardName = vanguard ? vanguard.dataset.name : "";

                if (card.dataset.persona === "true" && vanguardGrade === 3 && currentPhase === 'ride' && card.dataset.name === vanguardName) {
                    triggerPersonaRide();
                }

                applyStaticBonuses(card);
                handleRideAbilities(card); // Trigger ride abilities (including queue)
                sendMoveData(card);
                await checkDropAbilities(card); // Goildoat Drop Skill
                await checkOnPlaceAbilities(card); // Ensure on-place triggers for V
                updatePhaseUI(true);
                return true;
            }

            // 4b. Move to Rear-guard Circle (CALL or MOVE)
            if (zone.classList.contains('rc')) {
                // IF MOVING WITHIN FIELD
                if (isFromField) {
                    if (currentPhase !== 'main') {
                        alert("Rear-guards can only be moved during the Main Phase!");
                        return false;
                    }

                    // Restriction: Same vertical column only
                    const oldZone = oldParent.dataset.zone || "";
                    const newZone = zone.dataset.zone || "";

                    const getCol = (z) => {
                        if (z.includes('left')) return 'left';
                        if (z.includes('right')) return 'right';
                        if (z.includes('center') || z === 'vc') return 'center';
                        return 'none';
                    };

                    if (getCol(oldZone) !== getCol(newZone)) {
                        alert("กฎกติกา: เรียร์การ์ดสามารถย้ายหรือสลับตำแหน่งได้เฉพาะในแถวเดียวกัน (แนวตั้ง) เท่านั้น!");
                        return false;
                    }

                    // Swapping logic
                    const existingCard = zone.querySelector('.card:not(.opponent-card)');
                    if (existingCard) {
                        oldParent.appendChild(existingCard);
                        existingCard.style.transform = 'none';
                        sendMoveData(existingCard);
                    }
                    zone.appendChild(card);
                    card.style.transform = 'none';
                    sendMoveData(card);

                    // Re-apply bonuses (Persona might be active/inactive in different rows)
                    applyStaticBonuses(card);
                    if (existingCard) applyStaticBonuses(existingCard);

                    return true;
                }

                // IF CALLING FROM HAND
                if (currentPhase !== 'main') {
                    alert("คุณสามารถคอลยูนิทจากมือได้เฉพาะในช่วง Main Phase เท่านั้น!");
                    return false;
                }

                const skillLC = (card.dataset.skill || "").toLowerCase();
                const isVairina = (card.dataset.name || "").includes("Vairina");
                const isOD = isVairina && skillLC.includes('overdress') && !skillLC.includes('x-overdress') && !skillLC.includes('xoverdress');
                const isXOD = isVairina && (skillLC.includes('x-overdress') || skillLC.includes('xoverdress'));

                if (isOD || isXOD) {
                    const choice = await vgConfirm(`${card.dataset.name}: คุณต้องการคอลปกติ หรือ Dress (ซ้อนทับยูนิท)? (กด CONFIRM เพื่อ Dress / CANCEL เพื่อคอลปกติ)`);
                    if (choice) {
                        if (isXOD) await performXoverDress(card);
                        else await performOverDress(card);
                        return true;
                    }
                }

                if (cardGrade > vanguardGrade) { alert("ไม่สามารถคอลยูนิทที่มีเกรดสูงกว่าแวนการ์ดของคุณได้!"); return false; }

                // --- Wayward Therapy Angel [CONT]: Cannot be normal called from hand ---
                if (isFromHand && card.dataset.name && card.dataset.name.includes('Wayward Therapy Angel')) {
                    alert("Wayward Therapy Angel: [CONT] การ์ดใบนี้ไม่สามารถคอลปกติจากมือได้! (ใช้ความสามารถ discard เพื่อคอลลงแถวหลังแทน)");
                    return false;
                }

                const dropZone = document.querySelector('.my-side .drop-zone');
                zone.querySelectorAll('.card:not(.opponent-card)').forEach(c => {
                    // Drop Materials first
                    if (c.unitSoul && c.unitSoul.length > 0) {
                        c.unitSoul.forEach(m => {
                            dropZone.appendChild(m);
                            sendMoveData(m);
                        });
                        c.unitSoul = [];
                    }
                    dropZone.appendChild(c);
                    c.classList.remove('rest');
                    c.style.transform = 'none';
                    sendMoveData(c);
                });

                card.dataset.fromHand = "true";
                zone.appendChild(card);
                updateDropCount();

                applyStaticBonuses(card);
                await checkOnPlaceAbilities(card);
                sendMoveData(card);
                updateSoulUI();
                updateHandCount();
                return true;
            }
        }

        // 5. Drop Zone Validation (Discard for Ride Cost)
        if (zone.classList.contains('drop-zone')) {
            if (isFromHand) {
                const isRidePhase = currentPhase === 'ride' || phases[currentPhaseIndex] === 'ride';
                const canAutoRide = isRidePhase && !hasDiscardedThisTurn && !hasRiddenThisTurn;
                const isDefending = isGuarding;
                const isClickToRide = isRidePhase && document.querySelector('.player-hand .card.selected-for-ride') === card;

                if (!canAutoRide && !isDefending && !isClickToRide) {
                    alert("Movement Blocked: You can only discard from hand to pay for a Ride cost or when Guarding.");
                    return false;
                }

                if (canAutoRide) {
                    const vanguard = document.querySelector('.my-side .circle.vc .card');
                    const vanguardGrade = vanguard ? parseInt(vanguard.dataset.grade) : 0;
                    const nextGrade = vanguardGrade + 1;
                    const rideDeckZone = document.getElementById('ride-deck');
                    const nextRideCard = Array.from(rideDeckZone.querySelectorAll('.card')).find(c => parseInt(c.dataset.grade) === nextGrade);

                    if (nextRideCard) {
                        const discardedCard = card; // The card being moved to Drop is the discard for Ride
                        hasDiscardedThisTurn = true;
                        hasRiddenThisTurn = true;
                        setTimeout(() => {
                            if (vanguard) {
                                soulPool.push(vanguard);
                                vanguard.remove();
                                sendMoveData(vanguard);
                                updateSoulUI();
                            }
                            const vcZone = document.querySelector('.my-side .circle.vc');
                            vcZone.appendChild(nextRideCard);
                            nextRideCard.classList.remove('rest', 'opponent-card');
                            nextRideCard.style.transform = 'none';

                            applyStaticBonuses(nextRideCard);
                            sendMoveData(nextRideCard);
                            handleRideAbilities(nextRideCard, discardedCard);
                            alert(`Auto-Ride: ${nextRideCard.dataset.name}!`);

                            // Move to Main Phase after ride
                            setTimeout(() => {
                                currentPhaseIndex = phases.indexOf('main');
                                updatePhaseUI(true);
                            }, 800);
                        }, 500);

                    } else {
                        alert(`ไม่พบยูนิทเกรด ${nextGrade} ใน Ride Deck ของคุณ!`);
                        return false;
                    }
                }
            }

            if (card.unitSoul && card.unitSoul.length > 0) {
                card.unitSoul.forEach(m => {
                    zone.appendChild(m);
                    sendMoveData(m);
                });
                card.unitSoul = [];
            }
            
            const isWaywardDrop = isFromHand && card.dataset.name && card.dataset.name.includes("Wayward Therapy Angel");
            if (isWaywardDrop) {
                card.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;
                handleWaywardDiscard(card); // Don't await, let it prompt independently
                return true;
            }

            zone.appendChild(card);
            card.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;
            sendMoveData(card);
            updateHandCount();
            updateDropCount();
            return true;
        }
        return false;
    }

    function applyStaticBonuses(card) {
        if (!card) return;
        const name = card.dataset.name || "";
        const parent = card.parentElement;
        const zone = parent ? parent.dataset.zone : "";
        const isFrontRow = zone && (zone.startsWith('rc_front_') || zone === 'vc');

        // Shock Strategy check removed (Legacy)

        // --- Blue Deathster, Asagi Milestone [CONT] ---
        if (name.includes('Asagi Milestone') && zone.startsWith('rc')) {
            if (isMyTurn && lastStrategyPutIntoSoulName !== "") {
                if (card.dataset.asagiBonusApplied !== "true") {
                    card.dataset.power = (parseInt(card.dataset.power || card.dataset.basePower || "0") + 5000).toString();
                    card.dataset.asagiBonusApplied = "true";
                }
            } else if (card.dataset.asagiBonusApplied === "true") {
                card.dataset.power = (parseInt(card.dataset.power || card.dataset.basePower || "0") - 5000).toString();
                card.dataset.asagiBonusApplied = "false";
            }
        }

        // --- Seraph Snow [CONT](VC) ---
        if (name.includes('Seraph Snow') && zone === 'vc') {
            const imprisonedCount = document.querySelectorAll('.my-side .order-zone .card.opponent-card').length;
            const meetsCondition = isMyTurn && (imprisonedCount >= 1);
            if (meetsCondition) {
                if (card.dataset.seraphBuffApplied !== "true") {
                    card.dataset.power = (parseInt(card.dataset.power) + 10000).toString();
                    card.dataset.seraphBuffApplied = "true";
                    syncPowerDisplay(card);
                }
                if (imprisonedCount >= 3) {
                    card.dataset.drive = "3";
                } else {
                    delete card.dataset.drive;
                }
            } else if (card.dataset.seraphBuffApplied === "true") {
                // Return to base if buff was applied but conditions no longer met
                card.dataset.power = (parseInt(card.dataset.power) - 10000).toString();
                card.dataset.seraphBuffApplied = "false";
                syncPowerDisplay(card);
                delete card.dataset.drive;
            }
        }

        // --- Blitz Staff, Muna [CONT](RC) (+5000 and Resist if 3+ Prison) ---
        if (name.includes('Muna') && zone.startsWith('rc')) {
            const impCount = document.querySelectorAll('.my-side .order-zone .card.opponent-card').length;
            if (impCount >= 3) {
                if (card.dataset.munaBuffApplied !== "true") {
                    card.dataset.power = (parseInt(card.dataset.power) + 5000).toString();
                    card.dataset.munaBuffApplied = "true";
                    card.dataset.resist = "true";
                    syncPowerDisplay(card);
                }
            } else if (card.dataset.munaBuffApplied === "true") {
                card.dataset.power = (parseInt(card.dataset.power) - 5000).toString();
                card.dataset.munaBuffApplied = "false";
                card.dataset.resist = "false";
                syncPowerDisplay(card);
            }
        }

        // --- Aurora Battle Princess, Lifle Royar [CONT](RC) (+5000 if 2+ Prison) ---
        if (name.includes('Lifle Royar') && zone.startsWith('rc')) {
            const impCount = document.querySelectorAll('.my-side .order-zone .card.opponent-card').length;
            if (isMyTurn && impCount >= 2) {
                if (card.dataset.lifleBuffApplied !== "true") {
                    card.dataset.power = (parseInt(card.dataset.power) + 5000).toString();
                    card.dataset.lifleBuffApplied = "true";
                    syncPowerDisplay(card);
                }
            } else if (card.dataset.lifleBuffApplied === "true") {
                card.dataset.power = (parseInt(card.dataset.power) - 5000).toString();
                card.dataset.lifleBuffApplied = "false";
                syncPowerDisplay(card);
            }
        }

        // --- Penetrate Aquas [CONT](RC/GC) ---
        if (name.includes('Penetrate Aquas') && (zone.startsWith('rc') || zone === 'gc_player')) {
            const imprisonedCount = document.querySelectorAll('.my-side .order-zone .card.opponent-card').length;
            if (imprisonedCount >= 2) {
                if (card.dataset.aquasBuffApplied !== "true") {
                    card.dataset.power = (parseInt(card.dataset.power) + 5000).toString();
                    card.dataset.shield = (parseInt(card.dataset.shield || "0") + 10000).toString();
                    card.dataset.aquasBuffApplied = "true";
                    syncPowerDisplay(card);
                    const shieldSpan = card.querySelector('.card-shield');
                    if (shieldSpan) shieldSpan.innerHTML = `🛡️${card.dataset.shield}`;
                }
            } else if (card.dataset.aquasBuffApplied === "true") {
                card.dataset.power = (parseInt(card.dataset.power) - 5000).toString();
                card.dataset.shield = (Math.max(0, parseInt(card.dataset.shield || "0") - 10000)).toString();
                card.dataset.aquasBuffApplied = "false";
                syncPowerDisplay(card);
                const shieldSpan = card.querySelector('.card-shield');
                if (shieldSpan) shieldSpan.innerHTML = `🛡️${card.dataset.shield}`;
            }
        }

        // --- Seraph Purelight [CONT](VC) ---
        const vgCardPurelight = document.querySelector('.my-side .circle.vc .card');
        const isVgPurelight = vgCardPurelight && vgCardPurelight.dataset.name && vgCardPurelight.dataset.name.includes("Seraph Purelight");
        if (isVgPurelight && isMyTurn && (zone === 'vc' || zone === 'rc_front_left' || zone === 'rc_front_right')) {
            const imprisonedCount = document.querySelectorAll('.my-side .order-zone .card.opponent-card').length;
            const purelightPowerBuff = Math.floor(imprisonedCount / 2) * 5000;
            const purelightCritBuff = imprisonedCount >= 10 ? 1 : 0;
            
            let oldPower = parseInt(card.dataset.purelightPower || "0");
            let oldCrit = parseInt(card.dataset.purelightCrit || "0");
            
            if (oldPower !== purelightPowerBuff) {
               card.dataset.power = (parseInt(card.dataset.power) - oldPower + purelightPowerBuff).toString();
               card.dataset.purelightPower = purelightPowerBuff.toString();
               syncPowerDisplay(card);
            }
            if (oldCrit !== purelightCritBuff) {
               card.dataset.critical = (parseInt(card.dataset.critical || card.dataset.baseCritical || "1") - oldCrit + purelightCritBuff).toString();
               card.dataset.purelightCrit = purelightCritBuff.toString();
               syncPowerDisplay(card);
            }
        } else if (card.dataset.purelightPower !== undefined) {
            let oldPower = parseInt(card.dataset.purelightPower || "0");
            let oldCrit = parseInt(card.dataset.purelightCrit || "0");
            if (oldPower > 0) card.dataset.power = (parseInt(card.dataset.power) - oldPower).toString();
            if (oldCrit > 0) card.dataset.critical = (parseInt(card.dataset.critical || card.dataset.baseCritical || "1") - oldCrit).toString();
            delete card.dataset.purelightPower;
            delete card.dataset.purelightCrit;
            syncPowerDisplay(card);
        }

        // --- Sequana [CONT](RC): +2000 during your turn if VG has "Youthberk" ---
        if (name.includes('Sequana') && zone.startsWith('rc')) {
            const vgCard = document.querySelector('.my-side .circle.vc .card');
            const vgHasYouthberk = vgCard && vgCard.dataset.name && vgCard.dataset.name.includes('Youthberk');
            if (isMyTurn && vgHasYouthberk) {
                if (card.dataset.sequanaBuffApplied !== "true") {
                    card.dataset.power = (parseInt(card.dataset.power) + 2000).toString();
                    card.dataset.sequanaBuffApplied = "true";
                }
            } else if (card.dataset.sequanaBuffApplied === "true") {
                card.dataset.power = (parseInt(card.dataset.power) - 2000).toString();
                card.dataset.sequanaBuffApplied = "false";
            }
        }

        // Findanis CONT power bonus removed per user request

        // --- Avantgarda ACT Skill Power (+5000) ---
        if (card.dataset.avantSkillPowerBuffed === "true" && isMyTurn && zone === 'vc') {
            if (card.dataset.avantSkillBuffApplied !== "true") {
                card.dataset.power = (parseInt(card.dataset.power) + 5000).toString();
                card.dataset.avantSkillBuffApplied = "true";
                syncPowerDisplay(card);
            }
        } else if (card.dataset.avantSkillBuffApplied === "true") {
            card.dataset.power = (parseInt(card.dataset.power) - 5000).toString();
            card.dataset.avantSkillBuffApplied = "false";
            syncPowerDisplay(card);
        }

        // --- Greedon (Boshokku Soul Bonus) (+5000 for EACH copy in soul) ---
        if (card.dataset.name && card.dataset.name.includes('Greedon') && zone === 'vc') {
            const boshokkuInSoul = soulPool.filter(c => (c.dataset.name || "").includes('Boshokku'));
            const count = boshokkuInSoul.length;
            const damageCount = document.querySelectorAll('.my-side .damage-zone .card').length;
            const meetsCondition = isMyTurn && count > 0 && damageCount >= 4;
            
            if (meetsCondition) {
                const totalBuff = count * 5000;
                if (parseInt(card.dataset.greedonSoulBonusApplied || "0") !== totalBuff) {
                    card.dataset.power = (parseInt(card.dataset.power) - parseInt(card.dataset.greedonSoulBonusApplied || "0")).toString();
                    card.dataset.power = (parseInt(card.dataset.power) + totalBuff).toString();
                    card.dataset.greedonSoulBonusApplied = totalBuff.toString();
                    syncPowerDisplay(card);
                }
            } else if (parseInt(card.dataset.greedonSoulBonusApplied || "0") > 0) {
                card.dataset.power = (parseInt(card.dataset.power) - parseInt(card.dataset.greedonSoulBonusApplied || "0")).toString();
                card.dataset.greedonSoulBonusApplied = "0";
                syncPowerDisplay(card);
            }
        }

        // --- Disruption Strategy: Killshroud Power Buff (+5000) ---
        if (card.dataset.killshroudPowerBuffed === "true" && isMyTurn && zone === 'vc') {
            if (card.dataset.killshroudPowerBuffApplied !== "true") {
                card.dataset.power = (parseInt(card.dataset.power) + 5000).toString();
                card.dataset.killshroudPowerBuffApplied = "true";
                syncPowerDisplay(card);
            }
        } else if (card.dataset.killshroudPowerBuffApplied === "true") {
            card.dataset.power = (parseInt(card.dataset.power) - 5000).toString();
            card.dataset.killshroudPowerBuffApplied = "false";
            syncPowerDisplay(card);
        }

        // 1. Persona Ride (+10000 to front row and Vanguard)
        if (personaRideActive && isFrontRow && isMyTurn) {
            if (card.dataset.personaBuffed !== "true") {
                card.dataset.power = parseInt(card.dataset.power) + 10000;
                card.dataset.personaBuffed = "true";
                syncPowerDisplay(card);
            }
        } else {
            if (card.dataset.personaBuffed === "true") {
                card.dataset.power = parseInt(card.dataset.power) - 10000;
                card.dataset.personaBuffed = "false";
                syncPowerDisplay(card);
            }
        }

        // --- Dragontree Marker Buff (+5000) ---
        if (zone.startsWith('rc') && parent.dataset.dragontreeMarker === "true" && isMyTurn) {
            if (card.dataset.dragontreeBuffApplied !== "true") {
                card.dataset.power = (parseInt(card.dataset.power) + 5000).toString();
                card.dataset.dragontreeBuffApplied = "true";
                syncPowerDisplay(card);
            }
        } else if (card.dataset.dragontreeBuffApplied === "true") {
            card.dataset.power = (parseInt(card.dataset.power) - 5000).toString();
            card.dataset.dragontreeBuffApplied = "false";
            syncPowerDisplay(card);
        }

        // --- Desire Devil, Saasyou [CONT](RC)/(GC) ---
        if (name.includes('Saasyou') && (zone.startsWith('rc') || zone === 'gc')) {
            const desireDevils = soulPool.filter(c => (c.dataset.name || "").includes('Desire Devil')).length;
            if (desireDevils >= 3) {
                if (card.dataset.saasyouBuffApplied !== "true") {
                    card.dataset.power = (parseInt(card.dataset.power || "0") + 5000).toString();
                    card.dataset.shield = (parseInt(card.dataset.shield || "0") + 5000).toString();
                    card.dataset.saasyouBuffApplied = "true";
                    syncPowerDisplay(card);
                    if(zone === 'gc') updateGCShield();
                }
            } else if (card.dataset.saasyouBuffApplied === "true") {
                card.dataset.power = (parseInt(card.dataset.power || "0") - 5000).toString();
                card.dataset.shield = (parseInt(card.dataset.shield || "0") - 5000).toString();
                card.dataset.saasyouBuffApplied = "false";
                syncPowerDisplay(card);
                if(zone === 'gc') updateGCShield();
            }
        }

        // Bomber Strategy Dusting (+10000 Vanguard) - REMOVED DUPLICATE

        // --- Blaster Dark [CONT] (+5000 if RG retired) ---
        if (name.includes('Blaster Dark') && zone.startsWith('rc')) {
            if (isMyTurn && window.myRGRetiredThisTurn) {
                if (card.dataset.darkBonusApplied !== "true") {
                    card.dataset.power = parseInt(card.dataset.power) + 5000;
                    card.dataset.darkBonusApplied = "true";
                }
            } else if (card.dataset.darkBonusApplied === "true") {
                card.dataset.power = parseInt(card.dataset.power) - 5000;
                card.dataset.darkBonusApplied = "false";
            }
        }

        // --- Majesty Lord Blaster [CONT] (+2000 Power / +1 Crit if Blade & Dark in soul) ---
        if (name.includes('Majesty Lord Blaster') && zone === 'vc') {
            const hasBlade = soulPool.some(c => c.dataset.name.includes('Blaster Blade'));
            const hasDark = soulPool.some(c => c.dataset.name.includes('Blaster Dark'));
            if (hasBlade && hasDark) {
                if (card.dataset.majestyBonusApplied !== "true") {
                    card.dataset.power = parseInt(card.dataset.power) + 2000;
                    card.dataset.critical = parseInt(card.dataset.critical || 1) + 1;
                    card.dataset.majestyBonusApplied = "true";
                }
            } else if (card.dataset.majestyBonusApplied === "true") {
                card.dataset.power = parseInt(card.dataset.power) - 2000;
                card.dataset.critical = parseInt(card.dataset.critical || 2) - 1;
                card.dataset.majestyBonusApplied = "false";
            }
        }

        // --- Little Sage, Maron [CONT] (+2000 Power if 3+ units) ---
        if (name.includes('Little Sage, Maron') && zone.startsWith('rc')) {
            const myUnits = document.querySelectorAll('.my-side .circle .card').length;
            if (isMyTurn && myUnits >= 3) {
                if (card.dataset.maronBonusApplied !== "true") {
                    card.dataset.power = (parseInt(card.dataset.power) + 2000).toString();
                    card.dataset.maronBonusApplied = "true";
                }
            } else if (card.dataset.maronBonusApplied === "true") {
                card.dataset.power = (parseInt(card.dataset.power) - 2000).toString();
                card.dataset.maronBonusApplied = "false";
            }
        }

        // --- Dragonic Overlord the End [CONT](VC): +5000 if "Dragonic Overlord" in soul ---
        if (name.toLowerCase().includes('the end') && zone === 'vc') {
            const hasOverlordInSoul = soulPool.some(c => c.dataset.name === 'Dragonic Overlord');
            if (isMyTurn && hasOverlordInSoul) {
                if (card.dataset.doteSoulBonusApplied !== "true") {
                    card.dataset.power = (parseInt(card.dataset.power) + 5000).toString();
                    card.dataset.doteSoulBonusApplied = "true";
                    syncPowerDisplay(card);
                }
            } else if (card.dataset.doteSoulBonusApplied === "true") {
                card.dataset.power = (parseInt(card.dataset.power) - 5000).toString();
                card.dataset.doteSoulBonusApplied = "false";
                syncPowerDisplay(card);
            }
        }

        // --- Knight of Old Fate, Cordiela [CONT] (Back Row Center Effects) ---
        if (name.includes('Cordiela')) {
            const vgNode = document.querySelector('.my-side .circle.vc .card');
            const isMajesty = vgNode && vgNode.dataset.name.includes('Majesty');
            const isBackCenter = zone === 'rc_back_center';

            if (isMajesty && isBackCenter) {
                // G2 Boost if Opp G3+
                const oppVG = document.querySelector('.opponent-side .circle.vc .card');
                const oppG3Plus = oppVG && parseInt(oppVG.dataset.grade) >= 3;
                if (oppG3Plus) {
                    document.querySelectorAll('.my-side .circle.rc .card:not(.opponent-card)').forEach(u => {
                        if (parseInt(u.dataset.grade) === 2) {
                            u.dataset.canBoost = "true";
                        }
                    });
                }
            } else {
                // Reset state (remove Boost from G2s if condition lost)
                document.querySelectorAll('.my-side .circle.rc .card:not(.opponent-card)').forEach(u => {
                    if (parseInt(u.dataset.grade) === 2) {
                        delete u.dataset.canBoost;
                    }
                });
            }
        }

        // --- Ordeal Dragon [CONT] (+5000 if Blade & Dark in soul) ---
        if (name.includes('Ordeal Dragon') && zone.startsWith('rc')) {
            const hasBlade = soulPool.some(c => c.dataset.name.includes('Blaster Blade'));
            const hasDark = soulPool.some(c => c.dataset.name.includes('Blaster Dark'));
            if (isMyTurn && hasBlade && hasDark) {
                if (card.dataset.ordealBonusApplied !== "true") {
                    card.dataset.power = parseInt(card.dataset.power) + 5000;
                    card.dataset.ordealBonusApplied = "true";
                }
            } else if (card.dataset.ordealBonusApplied === "true") {
                card.dataset.power = parseInt(card.dataset.power) - 5000;
                card.dataset.ordealBonusApplied = "false";
            }
        }

        // 2. Final Burst Action (Removed +10000 generic buff per user request)
        if (card.dataset.finalBurstPowerBuffed === "true") {
            card.dataset.power = (parseInt(card.dataset.power) - 10000).toString();
            card.dataset.finalBurstPowerBuffed = "false";
            syncPowerDisplay(card);
        }

        // 3. Jamil [CONT] Burst (+10000 Power / +5000 Shield) - Only for owner
        if (isFinalBurst && name.includes('Jamil')) {
            if (card.dataset.burstBonusApplied !== "true") {
                card.dataset.power = parseInt(card.dataset.power) + 10000;
                card.dataset.shield = parseInt(card.dataset.shield || "5000") + 5000;
                card.dataset.burstBonusApplied = "true";
            }
        } else {
            if (card.dataset.burstBonusApplied === "true") {
                card.dataset.power = parseInt(card.dataset.power) - 10000;
                card.dataset.shield = parseInt(card.dataset.shield || "5000") - 5000;
                card.dataset.burstBonusApplied = "false";
            }
        }

        // --- Dark States OT Rest of Game Effect (Your Turn Only) ---
        if (window.otDarkStatesActive && isMyTurn && zone === 'vc') {
            if (card.dataset.otDarkStatesActiveBuff !== "true") {
                card.dataset.power = parseInt(card.dataset.power) + 10000;
                card.dataset.critical = parseInt(card.dataset.critical || 1) + 1;
                card.dataset.otDarkStatesActiveBuff = "true";
            }
        } else if (card.dataset.otDarkStatesActiveBuff === "true") {
            card.dataset.power = parseInt(card.dataset.power) - 10000;
            card.dataset.critical = parseInt(card.dataset.critical || 2) - 1;
            card.dataset.otDarkStatesActiveBuff = "false";
        }

        // --- Stoicheia OT Front Row +10000 (Until end of turn) ---
        if (window.otStoicheiaActive && isMyTurn && isFrontRow) {
            if (card.dataset.otStoicheiaBuff !== "true") {
                card.dataset.power = parseInt(card.dataset.power) + 10000;
                card.dataset.otStoicheiaBuff = "true";
            }
        } else if (card.dataset.otStoicheiaBuff === "true") {
            card.dataset.power = parseInt(card.dataset.power) - 10000;
            card.dataset.otStoicheiaBuff = "false";
        }

        // --- Galondight / Vairina Arcs Turn-End Buffs ---
        if (card.dataset.turnEndBuffActive === "true" && isMyTurn) {
            const val = parseInt(card.dataset.turnEndBuffPower || "0");
            if (card.dataset.turnEndBuffApplied !== "true") {
                card.dataset.power = parseInt(card.dataset.power) + val;
                card.dataset.turnEndBuffApplied = "true";
            }
        } else if (card.dataset.turnEndBuffApplied === "true") {
            const val = parseInt(card.dataset.turnEndBuffPower || "0");
            card.dataset.power = parseInt(card.dataset.power) - val;
            card.dataset.turnEndBuffApplied = "false";
            card.dataset.turnEndBuffPower = "0";
        }


        // --- Disruption Strategy: Killshroud Debuff ---
        if (window.killshroudDebuffActive && name.includes('Avantgarda') === false && zone === 'vc' && !isMyTurn) {
            if (card.dataset.killshroudDebuffApplied !== "true") {
                card.dataset.power = parseInt(card.dataset.power) - 5000;
                card.dataset.killshroudDebuffApplied = "true";
            }
        } else if (card.dataset.killshroudDebuffApplied === "true") {
            card.dataset.power = parseInt(card.dataset.power) + 5000;
            card.dataset.killshroudDebuffApplied = "false";
        }


        // 4. Final Rush Static Bonus - Only for owner
        if (isFinalRush) {
            let frBonus = 0;
            if (name.includes('Eden') || name.includes('Julian') || name.includes('Steve') || name.includes('Richard')) frBonus = 5000;
            else if (name.includes('Ivanka')) frBonus = 2000;

            if (frBonus > 0 && card.dataset.frBonusApplied !== "true") {
                card.dataset.power = parseInt(card.dataset.power) + frBonus;
                card.dataset.frBonusApplied = "true";
            }
        } else {
            if (card.dataset.frBonusApplied === "true") {
                let frBonus = 0;
                if (name.includes('Eden') || name.includes('Julian') || name.includes('Steve') || name.includes('Richard')) frBonus = 5000;
                else if (name.includes('Ivanka')) frBonus = 2000;
                card.dataset.power = parseInt(card.dataset.power) - frBonus;
                card.dataset.frBonusApplied = "false";
            }
        }

        // 5. Stefanie Column Bonus - Works in opponent's turn too if WE are in Final Rush/Burst
        let stefanieBonus = 0;
        if (isFinalRush || isFinalBurst) {
            let myCol = null;
            if (zone.includes('left')) myCol = 'left';
            else if (zone.includes('right')) myCol = 'right';
            else if (zone.includes('center') || zone === 'vc') myCol = 'center';
            if (myCol) {
                const colZones = myCol === 'left' ? ['rc_front_left', 'rc_back_left'] :
                    myCol === 'right' ? ['rc_front_right', 'rc_back_right'] :
                        ['vc', 'rc_back_center'];
                colZones.forEach(z => {
                    if (z !== zone) {
                        const targetCircle = document.querySelector(`.my-side .circle[data-zone="${z}"]`);
                        if (targetCircle) {
                            const c = targetCircle.querySelector('.card:not(.opponent-card)');
                            if (c && c.dataset.name.includes('Stefanie')) stefanieBonus = 5000;
                        }
                    }
                });
            }
        }

        if (stefanieBonus > 0 && card.dataset.stefanieBuffed !== "true") {
            card.dataset.power = parseInt(card.dataset.power) + stefanieBonus;
            card.dataset.stefanieBuffed = "true";
            syncPowerDisplay(card);
        } else if (stefanieBonus === 0 && card.dataset.stefanieBuffed === "true") {
            card.dataset.power = parseInt(card.dataset.power) - 5000;
            card.dataset.stefanieBuffed = "false";
            syncPowerDisplay(card);
        }

        // --- Bomber Strategy: Dusting Buff ---
        if (bomberDustingPowerBuff && name.includes('Avantgarda') && zone === 'vc' && isMyTurn) {
            if (card.dataset.dustingBuffApplied !== "true") {
                card.dataset.power = (parseInt(card.dataset.power) + 10000).toString();
                card.dataset.dustingBuffApplied = "true";
                syncPowerDisplay(card);
            }
        } else if (card.dataset.dustingBuffApplied === "true") {
            card.dataset.power = (parseInt(card.dataset.power) - 10000).toString();
            card.dataset.dustingBuffApplied = "false";
            syncPowerDisplay(card);
        }

        // 6. Magnolia Elder [CONT] Bonus (+5000 to all rear-guards)
        const isElderActive = isMagnoliaElderSkillActive();
        const isOnRC = parent && parent.classList.contains('rc');
        if (isElderActive && isOnRC) {
            if (card.dataset.elderBuffed !== "true") {
                card.dataset.power = parseInt(card.dataset.power) + 5000;
                card.dataset.elderBuffed = "true";
            }
        } else {
            if (card.dataset.elderBuffed === "true") {
                card.dataset.power = parseInt(card.dataset.power) - 5000;
                card.dataset.elderBuffed = "false";
            }
        }

        // 7. Winnsapooh [CONT](RC) Bonus (+10000 if Magnolia was placed this turn)
        if (name.includes('Winnsapooh') && isOnRC && hasRiddenThisTurn) {
            const vg = document.querySelector('.my-side .circle.vc .card');
            const vgName = (vg ? vg.dataset.name : "").toLowerCase();
            if (vgName.includes('magnolia')) {
                if (card.dataset.winnsapoohPlacedBuff !== "true") {
                    card.dataset.power = parseInt(card.dataset.power) + 10000;
                    card.dataset.winnsapoohPlacedBuff = "true";
                }
            }
        } else {
            if (card.dataset.winnsapoohPlacedBuff === "true") {
                card.dataset.power = parseInt(card.dataset.power) - 10000;
                card.dataset.winnsapoohPlacedBuff = "false";
            }
        }

        // 8. Enpix [CONT] Back Row (RC): +10000 Power
        const isBackRow = zone && zone.startsWith('rc_back_');
        if (name.includes('Enpix') && isBackRow) {
            if (card.dataset.enpixBackBuffed !== "true") {
                card.dataset.power = parseInt(card.dataset.power) + 10000;
                card.dataset.enpixBackBuffed = "true";
            }
        }

        // 9. Garou Vairina [CONT] X-overDress +10000 Power
        if (name.includes('Garou Vairina') && card.dataset.isXoverDress === "true") {
            if (card.dataset.garouXoverBuffed !== "true") {
                card.dataset.power = parseInt(card.dataset.power) + 10000;
                card.dataset.garouXoverBuffed = "true";
            }
        } else {
            if (card.dataset.garouXoverBuffed === "true") {
                card.dataset.power = parseInt(card.dataset.power) - 10000;
                card.dataset.garouXoverBuffed = "false";
            }
        }

        // 10. Vils Vairina [CONT] X-overDress +5000 Power / +10000 Shield / Resist
        if (name.includes('Vils Vairina') && card.dataset.isXoverDress === "true") {
            if (card.dataset.vilsXoverBuffed !== "true") {
                card.dataset.power = parseInt(card.dataset.power) + 5000;
                card.dataset.shield = parseInt(card.dataset.shield || "10000") + 10000;
                card.dataset.vilsXoverBuffed = "true";
                card.dataset.resist = "true";
            }
        } else {
            if (card.dataset.vilsXoverBuffed === "true") {
                card.dataset.power = parseInt(card.dataset.power) - 5000;
                card.dataset.shield = parseInt(card.dataset.shield || "20000") - 10000;
                card.dataset.vilsXoverBuffed = "false";
                card.dataset.resist = "false";
            }
        }

        // 11. Charis [CONT](RC): +2000 if order played
        if (name.includes('Charis') && isOnRC && orderPlayedThisTurn) {
            if (card.dataset.charisOrderBuff !== "true") {
                card.dataset.power = parseInt(card.dataset.power) + 2000;
                card.dataset.charisOrderBuff = "true";
            }
        } else if (card.dataset.charisOrderBuff === "true") {
            card.dataset.power = parseInt(card.dataset.power) - 2000;
            card.dataset.charisOrderBuff = "false";
        }

        // 6. Nirvana Jheva Ride Line Column Bonus (+5000 if Prayer Dragon in column)
        const isRinoOrReiyu = name.includes('Rino') || name.includes('Reiyu');
        if (isRinoOrReiyu && isMyTurn) {
            let myCol = null;
            if (zone.includes('left')) myCol = 'left';
            else if (zone.includes('right')) myCol = 'right';
            else if (zone.includes('center') || zone === 'vc') myCol = 'center';

            if (myCol) {
                const colZones = myCol === 'left' ? ['rc_front_left', 'rc_back_left'] :
                    myCol === 'right' ? ['rc_front_right', 'rc_back_right'] :
                        ['vc', 'rc_back_center'];

                let hasPrayerDragon = false;
                colZones.forEach(z => {
                    if (z !== zone) {
                        const targetCircle = document.querySelector(`.my-side .circle[data-zone="${z}"]`);
                        const otherCard = targetCircle ? targetCircle.querySelector('.card:not(.opponent-card)') : null;
                        if (otherCard && (otherCard.dataset.name.includes('Equip Dragon') || otherCard.dataset.name.includes('Trickstar'))) {
                            hasPrayerDragon = true;
                        }
                    }
                });

                if (hasPrayerDragon && card.dataset.columnBonusApplied !== "true") {
                    card.dataset.power = parseInt(card.dataset.power) + 5000;
                    card.dataset.columnBonusApplied = "true";
                } else if (!hasPrayerDragon && card.dataset.columnBonusApplied === "true") {
                    card.dataset.power = parseInt(card.dataset.power) - 5000;
                    card.dataset.columnBonusApplied = "false";
                }
            }
        }

        syncPowerDisplay(card);
    }

    function syncPowerDisplay(card) {
        if (!card) return;

        const pSpan = card.querySelector('.card-power');
        if (pSpan) {
            const powerVal = parseInt(card.dataset.power || "0");
            const cVal = parseInt(card.dataset.critical || "1");
            let dCrit = cVal > 1 ? `<span style="color:gold;">★${cVal}</span>` : '';
            pSpan.innerHTML = `⚔️${powerVal >= 1000000 ? (powerVal / 1000000).toFixed(1) + 'M' : powerVal} ${dCrit}`;
        }
        const sSpan = card.querySelector('.card-shield');
        if (sSpan) {
            sSpan.innerHTML = `🛡️${card.dataset.shield}`;
        }

        // Broadcast change if it's on a circle
        if (card.parentElement && card.parentElement.classList.contains('circle')) {
            sendMoveData(card);
        }

        // Auto Turn End Prompt - only check when not in targeting mode
        if (isMyTurn && phases[currentPhaseIndex] === 'battle' && !document.body.classList.contains('targeting-mode')) {
            checkAllAttackersRested();
        }
    }

    function checkAllAttackersRested() {
        if (!isMyTurn || phases[currentPhaseIndex] !== 'battle') return;
        if (isWaitingForGuard || currentAttackResolving || isProcessingDamage) return;
        if (document.body.classList.contains('targeting-mode')) return;

        // Check front-row RC units and Vanguard
        const allFieldUnits = Array.from(document.querySelectorAll('.my-side .circle .card:not(.opponent-card)'));
        const canAttackUnits = allFieldUnits.filter(u => {
            const z = u.parentElement ? (u.parentElement.dataset.zone || '') : '';
            // Front row RCs and Vanguard can attack
            return z === 'vc' || z === 'rc_front_left' || z === 'rc_front_right';
        });

        // If all units that CAN attack are rested
        const standingAttackers = canAttackUnits.filter(u => !u.classList.contains('rest'));

        if (standingAttackers.length === 0 && canAttackUnits.length > 0 && !window.promptedEndTurn) {
            window.promptedEndTurn = true;
            setTimeout(async () => {
                // Double-check state hasn't changed
                if (!isMyTurn || phases[currentPhaseIndex] !== 'battle') { window.promptedEndTurn = false; return; }
                if (isWaitingForGuard || currentAttackResolving || isProcessingDamage || document.body.classList.contains('targeting-mode')) { window.promptedEndTurn = false; return; }

                const recheck = Array.from(document.querySelectorAll('.my-side .circle .card:not(.opponent-card)'))
                    .filter(u => {
                        const z = u.parentElement ? (u.parentElement.dataset.zone || '') : '';
                        return (z === 'vc' || z === 'rc_front_left' || z === 'rc_front_right') && !u.classList.contains('rest');
                    });

                if (recheck.length === 0) {
                    if (await vgConfirm("ยูนิทที่โจมตีได้ทั้งหมดอยู่ในสภาพ Rest แล้ว คุณต้องการจบเทิร์นหรือไม่?")) {
                        // Auto-click the End Turn button
                        nextTurnBtn.click();
                    }
                }
                window.promptedEndTurn = false;
            }, 1500);
        }
    }

    async function handleMajestyAttackSkills(vanguard) {
        const rcUnits = Array.from(document.querySelectorAll('.my-side .circle.rc .card:not(.opponent-card)'));
        const blade = rcUnits.find(c => c.dataset.name === 'Blaster Blade');
        const dark = rcUnits.find(c => c.dataset.name === 'Blaster Dark');

        if (!blade && !dark) return;

        let options = [];
        if (blade && dark) options.push("Both (Retire & Drive+1)");
        if (blade) options.push("Blaster Blade (Retire 1)");
        if (dark) options.push("Blaster Dark (Drive +1)");
        options.push("None");

        const msg = "Majesty Lord Blaster: เลือกความสามารถที่ต้องการใช้งาน (นำยูนิทเข้าโซล)";
        const choice = await vgConfirm(`${msg}\n\n${options.join(" | ")}\n\n(กด CONFIRM เพื่อเลือก / CANCEL เพื่อข้าม)`);

        if (!choice) return;

        // Since vgConfirm is binary, let's use a simpler sequential flow if they confirmed
        const useBoth = blade && dark && await vgConfirm("เลือกใช้งาน 'ทั้งคู่' (Blade และ Dark) ใช่หรือไม่?");

        if (useBoth) {
            // Process both
            [blade, dark].forEach(c => {
                const circle = c.parentElement;
                if (circle) circle.removeChild(c);
                soulPool.push(c);
                sendMoveData(c);
            });
            updateSoulUI();
            vanguard.dataset.power = parseInt(vanguard.dataset.power) + 20000;
            vanguard.dataset.majestyDriveBuff = "true";
            syncPowerDisplay(vanguard);
            alert("Majesty: นำ Blade & Darkเข้าโซล! (Power +20000, Drive +1)");

            // Retire prompt
            await majestyRetireLogic(vanguard);
        } else {
            const useBlade = blade && await vgConfirm("เลือกใช้งานเฉพาะ 'Blaster Blade' (Retire 1) ใช่หรือไม่?");
            if (useBlade) {
                const circle = blade.parentElement;
                if (circle) circle.removeChild(blade);
                soulPool.push(blade);
                updateSoulUI();
                sendMoveData(blade);
                vanguard.dataset.power = parseInt(vanguard.dataset.power) + 10000;
                syncPowerDisplay(vanguard);
                await majestyRetireLogic(vanguard);
            } else if (dark && await vgConfirm("เลือกใช้งานเฉพาะ 'Blaster Dark' (Drive +1) ใช่หรือไม่?")) {
                const circle = dark.parentElement;
                if (circle) circle.removeChild(dark);
                soulPool.push(dark);
                updateSoulUI();
                sendMoveData(dark);
                vanguard.dataset.power = parseInt(vanguard.dataset.power) + 10000;
                vanguard.dataset.majestyDriveBuff = "true";
                syncPowerDisplay(vanguard);
                alert("Majesty: ได้รับ Drive +1 และ Power +10000!");
            }
        }
        updateAllStaticBonuses(); // Ensure +2k/+1crit CONT ability is checked
    }

    async function majestyRetireLogic(vanguard) {
        const oppRGs = Array.from(document.querySelectorAll('.opponent-side .circle.rc .card'));
        const validTargets = oppRGs.filter(c => !isCardResistant(c));
        if (validTargets.length > 0) {
            alert("เลือกเรียร์การ์ดคู่แข่ง 1 ใบเพื่อรีไทร์");
            document.body.classList.add('targeting-mode');
            await new Promise(resolve => {
                const h = (e) => {
                    const t = e.target.closest('.opponent-side .circle.rc .card');
                    if (t) {
                        if (isCardResistant(t)) {
                            alert("ยูนิทนี้มี Resist! เลือกไม่ได้");
                            return;
                        }
                        e.stopPropagation();
                        document.querySelector('.opponent-side .drop-zone').appendChild(t);
                        sendData({ type: 'forceRetire', cardId: t.id.replace('opp-', '') });
                        document.body.classList.remove('targeting-mode');
                        document.removeEventListener('click', h, true);
                        applyStaticBonuses(vanguard);
                        resolve();
                    }
                };
                document.addEventListener('click', h, true);
            });
        } else {
            alert("คู่แข่งไม่มีเรียร์การ์ดให้รีไทร์!");
            applyStaticBonuses(vanguard);
        }
    }

    function isMagnoliaElderSkillActive() {
        const vg = document.querySelector('.my-side .circle.vc .card');
        if (!vg || !vg.dataset.name.includes('Magnolia Elder')) return false;

        const hasInSoul = soulPool.some(c => c.dataset.name.includes('Magnolia'));
        if (hasInSoul) return true;

        const hasOnField = Array.from(document.querySelectorAll('.my-side .circle.rc .card:not(.opponent-card)'))
            .some(c => c.dataset.name.includes('Magnolia'));
        return hasOnField;
    }

    function isCardResistant(card) {
        if (!card) return false;
        const rgCount = document.querySelectorAll('.my-side .circle.rc .card:not(.opponent-card)').length;
        if (rgCount <= 3) {
            const zone = card.parentElement ? card.parentElement.dataset.zone : null;
            if (zone) {
                const columnZones = {
                    'rc_front_left': ['rc_front_left', 'rc_back_left'],
                    'rc_back_left': ['rc_front_left', 'rc_back_left'],
                    'rc_front_right': ['rc_front_right', 'rc_back_right'],
                    'rc_back_right': ['rc_front_right', 'rc_back_right'],
                    'vc': ['vc', 'rc_back_center'],
                    'rc_back_center': ['vc', 'rc_back_center']
                };
                const myCol = columnZones[zone];
                if (myCol) {
                    const hasEnpix = myCol.some(z => {
                        const circle = document.querySelector(`.my-side .circle[data-zone="${z}"]`);
                        if (!circle) return false;
                        const c = circle.querySelector('.card:not(.opponent-card)');
                        return c && c.dataset.name.includes('Enpix');
                    });
                    if (hasEnpix) return true;
                }
            }
        }
        const name = card.dataset.name || "";
        if (name.includes('Trickstar') || name.includes('Enpix') || card.dataset.resist === "true") return true;
        return false;
    }




    async function processInletPulse(units) {
        const queue = units.map(unit => {
            return {
                name: 'Inlet Pulse Dragon',
                description: '[AUTO](RC) End of turn: Put into soul, draw 1 card.',
                resolve: async (done) => {
                    if (await vgConfirm(`Inlet Pulse Dragon: [AUTO](RC) เมื่อจบเทิร์นของคุณ หากมีการโจมตี 4 ครั้งขึ้นไปในเทิร์นนี้ [ต้นทุน][นำยูนิทนี้เข้าสู่โซล] จั่วการ์ด 1 ใบ?`)) {
                        const parent = unit.parentElement;
                        if (parent && parent.classList.contains('circle')) {
                            soulPool.push(unit);
                            // Avoid modifying parent.innerHTML directly to not destroy UI logic unexpectedly.
                            unit.remove();
                            // Update soul counter on VC
                            const vc = document.querySelector('.my-side .circle.vc');
                            if (vc) {
                                let badge = vc.querySelector('#soul-counter');
                                if (!badge) {
                                    vc.insertAdjacentHTML('beforeend', `<div id="soul-counter" class="soul-badge">Soul: ${soulPool.length}</div>`);
                                    vc.querySelector('#soul-counter').addEventListener('click', handleSoulView);
                                } else {
                                    badge.textContent = `Soul: ${soulPool.length}`;
                                }
                            }
                            updateSoulUI();
                            drawCard(true);
                            alert("Inlet Pulse Dragon: สำเร็จ! จั่วการ์ด 1 ใบ");
                            // Broadcast the move
                            sendData({
                                type: 'moveCard',
                                cardId: unit.id,
                                zone: 'soul'
                            });
                        }
                    }
                    if (done) done();
                }
            };
        });

        if (queue.length > 0) {
            await resolveAbilityQueue(queue);
        }
    }

    async function checkOnPlaceAbilities(card) {
        if (!card) return;
        const name = card.dataset.name || "";
        const parent = card.parentElement;
        if (!parent) return;
        const zone = parent.dataset.zone || "";
        const isRC = zone.startsWith('rc');
        const isFromHand = card.dataset.fromHand === "true";

        const vg = document.querySelector('.my-side .circle.vc .card');
        const vgName = (vg && vg.dataset.name) ? vg.dataset.name : "";
        const hasBlueDeathsterOrAvant = vgName.includes('Blue Deathster') || vgName.includes('Avantgarda');

        // --- Penetrate Aquas [AUTO]: Placed on RC ---

        // --- Penetrate Aquas [AUTO]: Placed on RC ---
        if (name.includes('Penetrate Aquas') && isRC) {
            if (await vgConfirm("Penetrate Aquas: [AUTO] เมื่อวางลง (RC) สั่งคู่แข่งให้เลือกการ์ด 1 ใบจากดรอปโซน นำไปขังในคุก?")) {
                sendData({ type: 'forceImprison', min: 1, max: 1, fromZone: 'drop' });
                alert("ส่งคำสั่งให้คู่แข่ง เลือกการ์ดดรอปโซนลงคุกแล้ว รอให้คู่แข่งทำรายการ...");
            }
        }

        // --- Accuse Makarite [AUTO]: Placed on RC from Hand ---
        if (name.includes('Accuse Makarite') && isRC && isFromHand) {
            if (await vgConfirm("Accuse Makarite: [AUTO] เมื่อคอลจากมือ [SB1] ขังใบบนสุดของกองการ์ดคู่แข่ง?\n(ถ้านักโทษมี 2 ใบ+ จะได้พลัง +5000 จนจบเทิร์น)")) {
                if (await paySoulBlast(1)) {
                    sendData({ type: 'forceImprison', min: 1, max: 1, fromZone: 'deck' });
                    alert("ส่งคำสั่งให้คู่แข่ง นำใบบนสุดกองลงคุกแล้ว...");
                    const imprisonedCount = document.querySelectorAll('.my-side .order-zone .card.opponent-card').length;
                    // Predict +1
                    if (imprisonedCount + 1 >= 2) {
                        card.dataset.power = (parseInt(card.dataset.power) + 5000).toString();
                        card.dataset.turnEndBuffPower = (parseInt(card.dataset.turnEndBuffPower || "0") + 5000).toString();
                        card.dataset.turnEndBuffActive = "true";
                        syncPowerDisplay(card);
                        sendMoveData(card);
                    }
                }
            }
        }

        // --- Cuff Spring [AUTO]: Placed on RC ---
        if (name.includes('Cuff Spring') && isRC) {
            if (await vgConfirm("Cuff Spring: [AUTO] เมื่อลง (RC) สั่งคู่แข่งเลือกการ์ดบนมือ 1 ใบลงคุก (หากสำเร็จคู่แข่งได้จั่ว 1 ใบ)?")) {
                sendData({ type: 'forceImprison', min: 1, max: 1, fromZone: 'hand', drawAfterMove: true });
                alert("ส่งคำสั่งให้คู่แข่ง เลือกการ์ดบนมือลงคุกแล้ว รอให้คู่แข่งทำรายการ...");
            }
        }

        // --- Burning Horn Dragon [AUTO]: เมื่อวางบน (RC) [CB1] ดูท็อป 7 เพื่อหา 'Overlord' ---
        if (name.includes('Burning Horn Dragon') && isRC) {
            if (await vgConfirm("Burning Horn Dragon: [AUTO] เมื่อลง RC จ่าย [CB1] ดูใบบนสุด 7 ใบ เพื่อนำการ์ดที่ติดชื่อ 'Overlord' 1 ใบขึ้นมือ?")) {
                if (payCounterBlast(1)) {
                    if (deckPool.length < 7) alert("การ์ดในกองมีไม่ถึง 7 ใบ!");
                    const revealed = deckPool.splice(0, Math.min(7, deckPool.length));
                    updateDeckCounter();
                    let cardFound = false;

                    openViewer("เลือกการ์ด 'Overlord' 1 ใบขึ้นมือ", revealed);
                    await new Promise(resolve => {
                        const selListener = (ev) => {
                            const clickedOption = ev.target.closest('.card');
                            if (clickedOption && clickedOption.parentElement === viewerGrid) {
                                const selectedName = clickedOption.dataset.name;
                                if (selectedName.includes('Overlord')) {
                                    cardFound = true;
                                    const cData = revealed.find(r => r.name === selectedName);
                                    if (cData) {
                                        const newlyAdded = createCardElement(cData);
                                        playerHand.appendChild(newlyAdded);
                                        sendMoveData(newlyAdded);
                                        updateHandSpacing();
                                        alert(`Burning Horn: นำ ${selectedName} ขึ้นมือแล้ว!`);
                                    }
                                    revealed.splice(revealed.indexOf(cData), 1);
                                    viewerGrid.removeEventListener('click', selListener);
                                    closeAndCleanup();
                                } else {
                                    alert("ต้องเลือกการ์ดที่ติดชื่อ 'Overlord' เท่านั้น!");
                                }
                            }
                        };
                        const closeAndCleanup = () => {
                            zoneViewer.classList.add('hidden');
                            deckPool.push(...revealed);
                            deckPool.sort(() => 0.5 - Math.random());
                            updateDeckCounter();
                            if (!cardFound) {
                                counterCharge(1);
                                alert("Burning Horn: ไม่พบการ์ดเป้าหมาย ทำการ [Counter-Charge 1]");
                            }
                            resolve();
                        };
                        viewerGrid.addEventListener('click', selListener);
                        closeViewerBtn.onclick = () => {
                            viewerGrid.removeEventListener('click', selListener);
                            closeAndCleanup();
                        };
                    });
                }
            }
        }

        // --- Dragontree Wretch, Skull Chemdah [AUTO]: Placed on RC ---
        if (name.includes('Skull Chemdah') && isRC) {
            if (await vgConfirm("Skull Chemdah: [AUTO] เมื่อวางบน (RC) จ่าย [CB1 & SB1] เพื่อวาง Dragontree marker และค้นหา Masque of Hydragrum จากกอง 1 ใบนำขึ้นมือ?")) {
                let costPaid = false;
                if (payCounterBlast(1)) {
                    if (await paySoulBlast(1)) {
                        costPaid = true;
                    } else {
                        counterCharge(1); // refund
                        alert("CB จ่ายสำเร็จ แต่ไม่มี Soul พอจ่าย SB1! ยกเลิกความสามารถ");
                    }
                }
                if (costPaid) {
                    alert("คลิกทำ Dragontree Marker! เลือกช่อง (RC) ที่ว่างเปล่าหรือช่อง (RC) ของคุณที่ยังไม่มี Dragontree marker");
                    document.body.classList.add('targeting-mode');
                    await new Promise(resolveChem => {
                        const rcListener = (ev) => {
                            const circle = ev.target.closest('.my-side .circle.rc');
                            if (circle) {
                                ev.stopPropagation();
                                if (circle.dataset.dragontreeMarker === "true") {
                                    alert("ช่องนี้มี Dragontree Marker อยู่แล้ว!");
                                    return;
                                }
                                circle.dataset.dragontreeMarker = "true";
                                circle.style.boxShadow = "inset 0 0 15px #f0f";
                                document.body.classList.remove('targeting-mode');
                                document.removeEventListener('click', rcListener, true);
                                alert("วาง Dragontree Marker สำเร็จ!");
                                resolveChem();
                            }
                        };
                        document.addEventListener('click', rcListener, true);
                    });

                    const masquesOrder = deckPool.filter(c => c.name.includes('Masque of Hydragrum'));
                    if (masquesOrder.length > 0) {
                        openViewer("นำ Masque of Hydragrum 1 ใบขึ้นมือ", masquesOrder);
                        await new Promise(resSearch => {
                            const addHydra = (e) => {
                                const clicked = e.target.closest('.card');
                                if (clicked && clicked.parentElement === viewerGrid) {
                                    const cName = clicked.dataset.name;
                                    const idx = deckPool.findIndex(c => c.name === cName);
                                    if (idx !== -1) {
                                        const pickedData = deckPool.splice(idx, 1)[0];
                                        const newlyAdded = createCardElement(pickedData);
                                        playerHand.appendChild(newlyAdded);
                                        sendMoveData(newlyAdded);
                                        if (typeof updateHandCount === 'function') updateHandCount();
                                        updateHandSpacing();
                                        alert(`นำ ${cName} ขึ้นมือแล้ว!`);
                                    }
                                    viewerGrid.removeEventListener('click', addHydra);
                                    zoneViewer.classList.add('hidden');
                                    resSearch();
                                }
                            };
                            viewerGrid.addEventListener('click', addHydra);
                            closeViewerBtn.onclick = () => {
                                viewerGrid.removeEventListener('click', addHydra);
                                zoneViewer.classList.add('hidden');
                                resSearch();
                            };
                        });
                    } else {
                        alert("ไม่พบ Masque of Hydragrum ในกอง");
                    }
                    deckPool.sort(() => 0.5 - Math.random());
                    updateDeckCounter();
                    updateAllStaticBonuses();
                }
            }
        }
        // --- Desire Devil, Mucca [AUTO]: Removed ---
        if (name.includes('Jamil') && isRC) {
            const currentVG = document.querySelector('.my-side .circle.vc .card');
            const currentVGName = currentVG ? currentVG.dataset.name : "";
            if (currentVGName.includes('Bruce')) {
                if (await vgConfirm("Jamil: [AUTO] เมื่อวางบน (RC) แวนการ์ดเป็น Bruce! จ่าย [CB1] เพื่อ [SC1] และคอลการ์ด 'Diabolos' เกรด 3 หรือต่ำกว่า 1 ใบจากโซล?")) {
                    if (payCounterBlast(1)) {
                        soulCharge(1);
                        alert("Jamil: [Soul-Charge 1] สำเร็จ! เลือกการ์ด 'Diabolos' เกรด 3 หรือต่ำกว่า 1 ใบจากโซลเพื่อคอล");
                        promptSoulCall('rc', () => { }, true);
                    }
                }
            }
        }

        // --- Ala Dargente [AUTO]: เมื่อวางบน (RC) [SB1] ค้นหา Strategy Card จากกอง ---
        if (name.includes('Ala Dargente') && isRC && isFromHand) {
            if (soulPool.length > 0) {
                if (await vgConfirm("Ala Dargente: [AUTO] เมื่อวางบน (RC) [SB1] ค้นหา Strategy Card จากกองที่ชื่อไม่ซ้ำกับที่เพิ่งใส่โซล นำ 1 ใบขึ้นมือ?")) {
                    if (await paySoulBlast(1)) {
                        // Find Strategy Cards in deck
                        const strategyCards = deckPool.filter(c =>
                            c.skill && c.skill.includes('Strategy') && c.skill.includes('[Set Order]')
                        );

                        // Filter out cards with same name as what was just put into soul
                        const uniqueStrategies = strategyCards.filter(c =>
                            c.name !== lastStrategyPutIntoSoulName
                        );

                        if (uniqueStrategies.length > 0) {
                            openViewer("เลือก Strategy Card 1 ใบ (ชื่อไม่ซ้ำ)", uniqueStrategies);
                            await new Promise(resolve => {
                                const pickHandler = (e) => {
                                    const clicked = e.target.closest('.card');
                                    if (clicked && clicked.parentElement === viewerGrid) {
                                        const selectedName = clicked.dataset.name;
                                        const idx = deckPool.findIndex(c => c.name === selectedName);
                                        if (idx !== -1) {
                                            const pickedData = deckPool.splice(idx, 1)[0];
                                            const pickedCard = createCardElement(pickedData);
                                            playerHand.appendChild(pickedCard);
                                            updateHandSpacing();
                                            updateDeckCounter();
                                            updateHandCount();
                                            sendMoveData(pickedCard);
                                            deckPool.sort(() => 0.5 - Math.random()); // Shuffle
                                            alert(`Ala Dargente: ${pickedData.name} ขึ้นมือแล้ว!`);
                                        }
                                        viewerGrid.removeEventListener('click', pickHandler);
                                        zoneViewer.classList.add('hidden');
                                        resolve();
                                    }
                                };
                                viewerGrid.addEventListener('click', pickHandler);
                            });
                        } else {
                            alert("ไม่พบ Strategy Card ที่ชื่อไม่ซ้ำในกอง!");
                        }
                    }
                }
            }
        }

        // --- Asagi Milestone [AUTO]: เมื่อวางบน (RC) [CB1] ค้นหา "Avantgarda" G3+ จากดรอป ---
        if (name.includes('Asagi Milestone') && isRC && isFromHand && hasBlueDeathsterOrAvant) {
            const dropZone = document.querySelector('.my-side .drop-zone');
            const avantInDrop = Array.from(dropZone.querySelectorAll('.card')).filter(c =>
                c.dataset.name.includes('Avantgarda') && parseInt(c.dataset.grade) >= 3
            );

            if (avantInDrop.length > 0) {
                if (await vgConfirm("Asagi Milestone: [AUTO] เมื่อวางบน (RC) [CB1] เลือก 'Avantgarda' G3+ จากดรอป 1 ใบขึ้นมือ?")) {
                    if (payCounterBlast(1)) {
                        if (avantInDrop.length === 1) {
                            const picked = avantInDrop[0];
                            playerHand.appendChild(picked);
                            updateHandSpacing();
                            updateHandCount();
                            updateDropCount();
                            sendMoveData(picked);
                            alert(`Asagi Milestone: ${picked.dataset.name} ขึ้นมือแล้ว!`);
                        } else {
                            openViewer("เลือก Avantgarda G3+ 1 ใบจากดรอป", avantInDrop.map(c => ({
                                name: c.dataset.name,
                                grade: c.dataset.grade,
                                power: c.dataset.power,
                                shield: c.dataset.shield,
                                skill: c.dataset.skill,
                                id: c.id,
                                imageUrl: c.querySelector('img')?.src || ''
                            })));
                            await new Promise(resolve => {
                                const pickHandler = (e) => {
                                    const clicked = e.target.closest('.card');
                                    if (clicked && clicked.parentElement === viewerGrid) {
                                        const selectedId = clicked.dataset.originalId || clicked.id;
                                        const actual = avantInDrop.find(c => c.id === selectedId);
                                        if (actual) {
                                            playerHand.appendChild(actual);
                                            updateHandSpacing();
                                            updateHandCount();
                                            updateDropCount();
                                            sendMoveData(actual);
                                            alert(`Asagi Milestone: ${actual.dataset.name} ขึ้นมือแล้ว!`);
                                        }
                                        viewerGrid.removeEventListener('click', pickHandler);
                                        zoneViewer.classList.add('hidden');
                                        resolve();
                                    }
                                };
                                viewerGrid.addEventListener('click', pickHandler);
                            });
                        }
                    }
                }
            }
        }

        // --- Hanada Halfway [AUTO]: เมื่อวางบน (RC) [CB1] จั่วการ์ด 1 ใบ ---
        if (name.includes('Hanada Halfway') && isRC && isFromHand && hasBlueDeathsterOrAvant) {
            if (await vgConfirm("Hanada Halfway: [AUTO] เมื่อวางบน (RC) [CB1] จั่วการ์ด 1 ใบ?")) {
                if (payCounterBlast(1)) {
                    drawCard(true);
                    alert("Hanada Halfway: จั่ว 1 ใบสำเร็จ!");
                }
            }
        }



        // --- Schneizal [AUTO]: เมื่อวางบน (RC) [CB1] ดู 5 ใบจากบนสุดของกอง เลือก "Youthberk" 1 ใบขึ้นมือ ---
        if (name.includes('Schneizal') && isRC) {
            if (await vgConfirm("Schneizal: [AUTO] เมื่อวางบน (RC) [CB1] ดู 5 ใบจากบนสุดของกอง เลือกการ์ดที่มีชื่อ \"Youthberk\" 1 ใบขึ้นมือ พร้อมทั้งยูนิทนี้พลัง +5000?")) {
                if (payCounterBlast(1)) {
                    // Power +5000
                    card.dataset.power = (parseInt(card.dataset.power) + 5000).toString();
                    card.dataset.turnEndBuffPower = (parseInt(card.dataset.turnEndBuffPower || "0") + 5000).toString();
                    card.dataset.turnEndBuffActive = "true";
                    syncPowerDisplay(card);
                    sendMoveData(card);
                    alert("Schneizal: พลัง +5000!");

                    if (deckPool.length > 0) {
                        const top5 = deckPool.slice(0, Math.min(5, deckPool.length));
                        const youthberkCards = top5.filter(c => c.name.includes('Youthberk'));

                        if (youthberkCards.length > 0) {
                            openViewer("เลือกการ์ดที่มีชื่อ \"Youthberk\" 1 ใบขึ้นมือ (หรือปิดเพื่อไม่เลือก)", youthberkCards);
                            await new Promise(resolve => {
                                const pickHandler = (e) => {
                                    const clicked = e.target.closest('.card');
                                    if (clicked && clicked.parentElement === viewerGrid) {
                                        const selectedName = clicked.dataset.name;
                                        const idx = deckPool.findIndex(c => c.name === selectedName);
                                        if (idx !== -1) {
                                            const pickedData = deckPool.splice(idx, 1)[0];
                                            const pickedCard = createCardElement(pickedData);
                                            playerHand.appendChild(pickedCard);
                                            updateHandSpacing();
                                            updateHandCount();
                                            sendMoveData(pickedCard);
                                            alert(`Schneizal: ${pickedData.name} ขึ้นมือแล้ว!`);
                                        }
                                        deckPool.sort(() => 0.5 - Math.random());
                                        updateDeckCounter();
                                        viewerGrid.removeEventListener('click', pickHandler);
                                        zoneViewer.classList.add('hidden');
                                        resolve();
                                    }
                                };
                                viewerGrid.addEventListener('click', pickHandler);
                                const closeH = () => {
                                    deckPool.sort(() => 0.5 - Math.random());
                                    updateDeckCounter();
                                    zoneViewer.classList.add('hidden');
                                    closeViewerBtn.removeEventListener('click', closeH);
                                    resolve();
                                };
                                closeViewerBtn.addEventListener('click', closeH);
                            });
                        } else {
                            deckPool.sort(() => 0.5 - Math.random());
                            updateDeckCounter();
                            alert("Schneizal: ไม่พบการ์ดที่มีชื่อ \"Youthberk\" ใน 5 ใบแรก!");
                        }
                    }
                }
            }
        }

        // --- Cairbre [AUTO]: When placed on (RC), [CB1 & SB1] look at top 3, choose 1 ---
        if (name.includes('Cairbre') && isRC) {
            if (await vgConfirm("Cairbre: [AUTO] เมื่อวางบน (RC) [CB1 & SB1] ดู 3 ใบจากบนสุดของกอง เลือก 1 ใบ (G2↓ unit คอลลง RC / อื่น ขึ้นมือ)?")) {
                if (payCounterBlast(1) && await paySoulBlast(1)) {
                    if (deckPool.length < 3) { alert("การ์ดในกองไม่พอ!"); return; }
                    const top3 = deckPool.slice(0, 3);
                    deckPool.splice(0, 3);

                    openViewer("เลือก 1 ใบ (G2↓ unit: คอลลง RC / อื่น: ขึ้นมือ)", top3);
                    await new Promise(resolve => {
                        const pickHandler = async (e) => {
                            const clicked = e.target.closest('.card');
                            if (clicked && clicked.parentElement === viewerGrid) {
                                const selectedName = clicked.dataset.name;
                                const idx = top3.findIndex(c => c.name === selectedName);
                                if (idx !== -1) {
                                    const picked = top3.splice(idx, 1)[0];
                                    const pickedGrade = parseInt(picked.grade || "0");
                                    const isUnit = !picked.skill || !picked.skill.includes('[Order]');

                                    if (pickedGrade <= 2 && isUnit) {
                                        // Call to RC - let player choose a circle
                                        alert(`Cairbre: คอล ${picked.name} (G${pickedGrade}) ลง (RC)! คลิกช่องที่ต้องการวาง`);
                                        const calledCard = createCardElement(picked);
                                        document.body.classList.add('targeting-mode');
                                        await new Promise(callRes => {
                                            const callListener = async (ev) => {
                                                const targetCircle = ev.target.closest('.my-side .circle.rc');
                                                if (targetCircle) {
                                                    ev.stopPropagation();
                                                    // Retire existing card in that circle
                                                    const existing = targetCircle.querySelector('.card:not(.opponent-card)');
                                                    if (existing) {
                                                        const dropZone = document.querySelector('.my-side .drop-zone');
                                                        dropZone.appendChild(existing);
                                                        existing.classList.remove('rest');
                                                        sendMoveData(existing);
                                                        updateDropCount();
                                                    }
                                                    targetCircle.appendChild(calledCard);
                                                    applyStaticBonuses(calledCard);
                                                    sendMoveData(calledCard);
                                                    document.body.classList.remove('targeting-mode');
                                                    document.removeEventListener('click', callListener, true);
                                                    alert(`Cairbre: ${picked.name} คอลลง RC สำเร็จ!`);
                                                    await checkOnPlaceAbilities(calledCard);
                                                    callRes();
                                                }
                                            };
                                            document.addEventListener('click', callListener, true);
                                        });
                                    } else {
                                        // Add to hand
                                        const pickedCard = createCardElement(picked);
                                        playerHand.appendChild(pickedCard);
                                        updateHandSpacing();
                                        updateHandCount();
                                        sendMoveData(pickedCard);
                                        alert(`Cairbre: ${picked.name} ขึ้นมือแล้ว!`);
                                    }

                                    // Return remaining to bottom of deck
                                    top3.forEach(c => deckPool.push(c));
                                }
                                deckPool.sort(() => 0.5 - Math.random());
                                updateDeckCounter();
                                viewerGrid.removeEventListener('click', pickHandler);
                                zoneViewer.classList.add('hidden');
                                resolve();
                            }
                        };
                        viewerGrid.addEventListener('click', pickHandler);
                        const closeH = () => {
                            top3.forEach(c => deckPool.push(c));
                            deckPool.sort(() => 0.5 - Math.random());
                            updateDeckCounter();
                            zoneViewer.classList.add('hidden');
                            closeViewerBtn.removeEventListener('click', closeH);
                            resolve();
                        };
                        closeViewerBtn.addEventListener('click', closeH);
                    });
                }
            }
        }
    }

    async function checkDropAbilities(newVanguard) {
        const vgName = (newVanguard.dataset.name || "").toLowerCase();
        if (!vgName.includes('magnolia')) return;

        const dropZone = document.querySelector('.my-side .drop-zone');
        if (!dropZone) return;
        const cardsInDrop = Array.from(dropZone.querySelectorAll('.card'));

        for (const card of cardsInDrop) {
            const name = card.dataset.name || "";
            if (name.includes('Goildoat')) {
                const hasGoildoatInSoul = soulPool.some(c => c.dataset.name.includes('Goildoat'));
                if (!hasGoildoatInSoul) {
                    if (await vgConfirm(`Goildoat (Drop): [AUTO] เมื่อไรด์ Magnolia จ่าย [เข้าโซล] เพื่อให้ VG พลัง+5000?`)) {
                        soulPool.push(card);
                        card.remove();
                        updateSoulUI();
                        updateDropCount();

                        newVanguard.dataset.power = parseInt(newVanguard.dataset.power) + 5000;
                        syncPowerDisplay(newVanguard);
                        alert("Goildoat: เข้าสู่โซลแล้ว! แวนการ์ดพลัง +5000");

                        sendData({
                            type: 'moveCard',
                            cardId: card.id,
                            zone: 'soul'
                        });
                        break;
                    }
                }
            }
        }
    }

    function updateAllStaticBonuses() {
        document.querySelectorAll('.my-side .circle .card:not(.opponent-card), .my-side .guardian-circle .card:not(.opponent-card)').forEach(c => {
            applyStaticBonuses(c);
            syncPowerDisplay(c); // Ensure power display and sendMoveData for opponent sync
        });
    }

    function triggerPersonaRide() {
        personaRideActive = true;

        // 1. Alert and Broadcast
        alert("PERSONA RIDE! ยูนิทแถวหน้าทั้งหมดได้รับพลัง +10000 สำหรับตาคุณ และจั่วการ์ด 1 ใบ!");
        sendData({ type: 'announcePersona' });

        // 2. Power up existing FRONT ROW units
        document.querySelectorAll('.my-side .circle .card:not(.opponent-card)').forEach(unit => {
            const zone = unit.parentElement ? unit.parentElement.dataset.zone : "";
            if ((zone && zone.startsWith('rc_front_')) || (unit.parentElement && unit.parentElement.classList.contains('vc'))) {
                // Check if already buffed to avoid double application (especially on the new V)
                if (unit.dataset.personaBuffed !== "true") {
                    unit.dataset.power = parseInt(unit.dataset.power) + 10000;
                    unit.dataset.personaBuffed = "true";
                    syncPowerDisplay(unit);
                }
            }
        });

        // 3. Draw 1 card
        setTimeout(() => drawCard(true), 500);

        // 4. Skip to Main Phase immediately
        setTimeout(() => {
            currentPhaseIndex = phases.indexOf('main');
            updatePhaseUI(true);
        }, 1200);
    }

    async function handleRideAbilities(newVanguard, discardedCard = null) {
        if (!newVanguard || (soulPool.length === 0 && !discardedCard)) {
            console.log("Ride Ability Check Skipped: Soul empty or no unit.");
            return;
        }
        // The card just ridden over is the last one added to soulPool in validateAndMoveCard
        const oldVanguard = soulPool.length > 0 ? soulPool[soulPool.length - 1] : null;
        console.log(`Ride Triggered: ${oldVanguard ? oldVanguard.dataset.name : "None"} -> ${newVanguard.dataset.name}`);
        await checkRideAbilities(oldVanguard, newVanguard, discardedCard);
    }


    function payCounterBlast(cost) {
        if (isAIMode && !isMyTurn) {
            const openCards = Array.from(document.querySelectorAll('.opponent-side .damage-zone .card:not(.face-down)'));
            if (openCards.length < cost) return false;
            for (let i = 0; i < cost; i++) {
                openCards[i].classList.add('face-down');
                sendMoveData(openCards[i]);
            }
            alert(`AI จ่าย Counter Blast ${cost} ใบ`);
            return true;
        }

        const openCards = Array.from(document.querySelectorAll('.my-side .damage-zone .card:not(.face-down)'));
        if (openCards.length < cost) {
            alert(`CB${cost} 失敗！ดาเมจโซนที่เปิดอยู่ไม่พอ (มี ${openCards.length} ใบ ต้องการ ${cost} ใบ)`);
            return false;
        }
        for (let i = 0; i < cost; i++) {
            openCards[i].classList.add('face-down');
            sendMoveData(openCards[i]);
        }
        const msg = `จ่าย Counter Blast ${cost} ใบ`;
        alert(msg);
        sendData({ type: 'announce', msg: `คู่แข่ง: ${msg}` });
        return true;
    }

    function promptCallFromDrop(count, filterFn, powerBonus = 0, onComplete = null) {
        const dropZone = document.querySelector('.my-side .drop-zone');
        const eligibleCards = Array.from(dropZone.querySelectorAll('.card')).filter(c => {
            if (c.classList.contains('opponent-card')) return false;
            if (filterFn && !filterFn(c)) return false;
            return true;
        });

        if (eligibleCards.length === 0) {
            alert("ไม่พบการ์ดที่ตรงเงื่อนไขในดรอปโซน!");
            if (onComplete) onComplete();
            return;
        }

        openViewer("เลือกการ์ดจากดรอปโซนเพื่อคอล", eligibleCards.map(c => ({
            name: c.dataset.name,
            grade: c.dataset.grade,
            power: c.dataset.power,
            shield: c.dataset.shield,
            skill: c.dataset.skill,
            id: c.id,
            imageUrl: c.querySelector('img')?.src || ''
        })));

        const pickHandler = (e) => {
            const clicked = e.target.closest('.card');
            if (clicked && clicked.parentElement === viewerGrid) {
                const selectedId = clicked.dataset.originalId || clicked.id;
                const actual = eligibleCards.find(c => c.id === selectedId);
                if (actual) {
                    viewerGrid.removeEventListener('click', pickHandler);
                    zoneViewer.classList.add('hidden');

                    // Prompt for RC selection
                    alert("เลือก RC เพื่อวางการ์ด");
                    document.body.classList.add('targeting-mode');
                    const rcHandler = (ev) => {
                        const circle = ev.target.closest('.my-side .circle.rc');
                        if (circle) {
                            ev.stopPropagation();
                            // Replace existing card if any
                            const existing = circle.querySelector('.card:not(.opponent-card)');
                            if (existing) {
                                dropZone.appendChild(existing);
                                existing.classList.remove('rest');
                                existing.style.transform = 'none';
                                sendMoveData(existing);
                            }
                            circle.appendChild(actual);
                            actual.classList.remove('rest');
                            actual.style.transform = 'none';

                            if (powerBonus > 0) {
                                actual.dataset.power = (parseInt(actual.dataset.power) + powerBonus).toString();
                                actual.dataset.turnEndBuffPower = (parseInt(actual.dataset.turnEndBuffPower || "0") + powerBonus).toString();
                                actual.dataset.turnEndBuffActive = "true";
                                alert(`${actual.dataset.name}: พลัง +${powerBonus}!`);
                            }

                            applyStaticBonuses(actual);
                            syncPowerDisplay(actual);
                            sendMoveData(actual);
                            updateDropCount();
                            document.body.classList.remove('targeting-mode');
                            document.removeEventListener('click', rcHandler, true);

                            if (onComplete) onComplete();
                        }
                    };
                    document.addEventListener('click', rcHandler, true);
                }
            }
        };
        viewerGrid.addEventListener('click', pickHandler);
    }

    async function paySoulBlast(cost) {
        if (isAIMode && !isMyTurn) {
            if (aiSoul.length < cost) {
                console.log("AI Insufficient Soul for SB!");
                return false;
            }
            for (let i = 0; i < cost; i++) {
                const blasted = aiSoul.pop();
                aiDrop.push(blasted);
                // Move to AI drop zone DOM
                const oppDropZone = document.querySelector('.opponent-side .drop-zone');
                if (oppDropZone) {
                    const node = createOpponentCardElement(blasted);
                    oppDropZone.appendChild(node);
                    sendMoveData(node);
                }
            }
            alert(`AI จ่าย Soul Blast ${cost} ใบ`);
            syncAIStateToUI();
            updateDropCount(); // Re-use general updater
            return true;
        }

        if (soulPool.length < cost) {
            alert("Insufficient Soul for SB!");
            return false;
        }

        return new Promise(resolve => {
            openViewer(`Select ${cost} card(s) to Soul Blast`, soulPool);
            let selectedCount = 0;
            const chosenIndices = [];

            const sel = (e) => {
                const clicked = e.target.closest('.card');
                if (clicked && clicked.parentElement === viewerGrid) {
                    const originalId = clicked.dataset.originalId;
                    const idx = soulPool.findIndex(c => c.id === originalId);
                    if (idx !== -1 && !chosenIndices.includes(idx)) {
                        chosenIndices.push(idx);
                        clicked.style.opacity = '0.5';
                        selectedCount++;
                        if (selectedCount >= cost) {
                            viewerGrid.removeEventListener('click', sel);
                            zoneViewer.classList.add('hidden');

                            chosenIndices.sort((a, b) => b - a);
                            const dropZone = document.querySelector('.my-side .drop-zone');
                            for (let i of chosenIndices) {
                                const blasted = soulPool.splice(i, 1)[0];
                                dropZone.appendChild(blasted);
                                sendMoveData(blasted);
                            }
                            updateSoulUI();
                            updateDropCount();
                            
                            const msg = `จ่าย Soul Blast ${cost} ใบ`;
                            alert(msg);
                            sendData({ type: 'announce', msg: `คู่แข่ง: ${msg}` });
                            resolve(true);
                        }
                    }
                }
            };
            viewerGrid.addEventListener('click', sel);
        });
    }

    function promptCallSteveVC() {
        if (soulPool.length === 0) {
            alert("Soul is empty! Performing Soul Charge 1 only.");
            soulCharge(1);
            return;
        }
        openViewer("Select 1 card to CALL to Center Back Row", soulPool);

        const selectionHandler = (e) => {
            const clicked = e.target.closest('.card');
            if (clicked && clicked.parentElement === viewerGrid) {
                const originalId = clicked.dataset.originalId;
                const originalIndex = soulPool.findIndex(c => c.id === originalId);

                if (originalIndex !== -1) {
                    const card = soulPool.splice(originalIndex, 1)[0];
                    zoneViewer.classList.add('hidden');
                    viewerGrid.removeEventListener('click', selectionHandler);

                    const centerBack = document.querySelector('.my-side .circle[data-zone="rc_back_center"]');
                    if (centerBack) {
                        // Vanguard Rule: Replacement
                        const oldCard = centerBack.querySelector('.card:not(.opponent-card)');
                        if (oldCard) {
                            soulPool.push(oldCard);
                            sendMoveData(oldCard, 'soul');
                            oldCard.remove();
                        }
                        centerBack.appendChild(card);
                        card.classList.remove('rest');
                        sendMoveData(card);
                        updateSoulUI();
                        alert(`${card.dataset.name} called! Performing Soul Charge 1.`);
                        soulCharge(1);
                    }
                }
            }
        };
        viewerGrid.addEventListener('click', selectionHandler);
    }

    async function handleWaywardDiscard(target) {
        const isWayward = target.dataset.name && target.dataset.name.includes('Wayward Therapy Angel');
        const vg = document.querySelector('.my-side .circle.vc .card');
        const vgGrade = vg ? parseInt(vg.dataset.grade || "0") : 0;
        const dropZone = document.querySelector('.my-side .drop-zone');

        // Always put it in the drop first
        dropZone.appendChild(target);
        sendMoveData(target);
        if (typeof updateHandCount === 'function') updateHandCount();
        if (typeof updateDropCount === 'function') updateDropCount();

        if (isWayward && isMyTurn && vgGrade >= 3 && soulPool.length > 0) {
            if (await vgConfirm("Wayward Therapy Angel: [AUTO] ถูกทิ้งจากมือ! [SB1] คอลลง แถวหลัง (RC)?")) {
                if (await paySoulBlast(1)) {
                    // Remove from drop zone
                    target.remove();

                    // Find empty back row RC
                    const backRows = ['rc_back_left', 'rc_back_center', 'rc_back_right'];
                    const emptyBackRow = backRows.find(z => {
                        const circle = document.querySelector(`.my-side .circle[data-zone="${z}"]`);
                        return circle && !circle.querySelector('.card:not(.opponent-card)');
                    });

                    if (emptyBackRow) {
                        const circle = document.querySelector(`.my-side .circle[data-zone="${emptyBackRow}"]`);
                        circle.appendChild(target);
                        target.classList.remove('rest');
                        applyStaticBonuses(target);
                        sendMoveData(target);
                        if (typeof updateDropCount === 'function') updateDropCount();
                        alert(`Wayward Therapy Angel: คอลลงแถวหลัง ${emptyBackRow} สำเร็จ!`);
                        if (typeof checkOnPlaceAbilities === 'function') await checkOnPlaceAbilities(target);
                    } else {
                        // Let player choose which back row to override
                        alert("เลือกช่องแถวหลังเพื่อวาง Wayward Therapy Angel");
                        document.body.classList.add('targeting-mode');
                        await new Promise(callRes => {
                            const callListener = async (ev) => {
                                const targetCircle = ev.target.closest('.my-side .circle.rc');
                                if (targetCircle) {
                                    const circleZone = targetCircle.dataset.zone || "";
                                    if (circleZone.includes('back')) {
                                        ev.stopPropagation();
                                        const existing = targetCircle.querySelector('.card:not(.opponent-card)');
                                        if (existing) {
                                            const drop = document.querySelector('.my-side .drop-zone');
                                            drop.appendChild(existing);
                                            existing.classList.remove('rest');
                                            sendMoveData(existing);
                                        }
                                        targetCircle.appendChild(target);
                                        target.classList.remove('rest');
                                        applyStaticBonuses(target);
                                        sendMoveData(target);
                                        if (typeof updateDropCount === 'function') updateDropCount();
                                        document.body.classList.remove('targeting-mode');
                                        document.removeEventListener('click', callListener, true);
                                        alert(`Wayward Therapy Angel: คอลลงแถวหลังสำเร็จ!`);
                                        if (typeof checkOnPlaceAbilities === 'function') await checkOnPlaceAbilities(target);
                                        callRes();
                                    } else {
                                        alert("เลือกได้เฉพาะช่องแถวหลังเท่านั้น!");
                                    }
                                }
                            };
                            document.addEventListener('click', callListener, true);
                        });
                    }
                }
            }
        }
    }

    async function payDiscard(count = 1) {
        if (isAIMode && !isMyTurn) {
            if (aiHand.length < count) return false;
            // AI Discards triggers first or high grade
            for (let i = 0; i < count; i++) {
                const discarded = aiHand.shift();
                aiDrop.push(discarded);
                const dropZone = document.querySelector('.opponent-side .drop-zone');
                if (dropZone) {
                    const node = createOpponentCardElement(discarded);
                    dropZone.appendChild(node);
                    sendMoveData(node);
                }
            }
            alert(`AI จ่ายคอสต์ด้วยการทิ้งการ์ดมือ ${count} ใบ`);
            syncAIStateToUI();
            updateDropCount();
            return true;
        }

        if (playerHand.querySelectorAll('.card').length < count) {
            alert("การ์ดบนมือไม่เพียงพอ!");
            return false;
        }
        alert(`เลือกการ์ด ${count} ใบจากบนมือเพื่อทิ้ง (Discard)`);
        document.body.classList.add('targeting-mode');
        let selectedCount = 0;
        const result = await new Promise(resolve => {
            const handler = async (e) => {
                const target = e.target.closest('.card:not(.opponent-card)');
                if (target && target.parentElement && target.parentElement.dataset.zone === 'hand') {
                    e.stopPropagation();
                    const dropZone = document.querySelector('.my-side .drop-zone');

                    // Wait for Wayward Therapy Angel resolution or normal discard
                    await handleWaywardDiscard(target);

                    let discardInc = 1;
                    const vgCardLocal = document.querySelector('.my-side .circle.vc .card');
                    if (target.dataset.name && target.dataset.name.includes('Dragritter, Halbe') && vgCardLocal && vgCardLocal.dataset.name.includes('Overlord')) {
                        if (await vgConfirm("Halbe: นับการทิ้งจากมือเป็น 2 ใบ (สำหรับสกิล Overlord)?")) {
                            discardInc = 2;
                        }
                    }

                    selectedCount += discardInc;
                    const discardMsg = `ทิ้งการ์ด (Discard) ${discardInc} ใบ`;
                    alert(discardMsg);
                    sendData({ type: 'announce', msg: `คู่แข่ง: ${discardMsg}` });

                    if (discardInc > 1 || (target.dataset.name && target.dataset.name.includes('Dragritter, Halbe') && isMyTurn)) {
                        if (await vgConfirm("Halbe: [AUTO] เมื่อถูกทิ้งเป็นคอสต์ คอลลงช่องแถวหลัง (RC) และรับพลัง +5000 จนจบเทิร์น?")) {
                            target.dataset.turnEndBuffPower = (parseInt(target.dataset.turnEndBuffPower || "0") + 5000).toString();
                            target.dataset.turnEndBuffActive = "true";
                            syncPowerDisplay(target);

                            alert("เลือกช่องแถวหลังเพื่อวาง Dragritter, Halbe");
                            document.body.classList.add('targeting-mode');
                            await new Promise(halbeRes => {
                                const halbeListener = async (ev) => {
                                    const targetCircle = ev.target.closest('.my-side .circle.rc');
                                    if (targetCircle) {
                                        const circleZone = targetCircle.dataset.zone || "";
                                        if (circleZone.includes('back')) {
                                            ev.stopPropagation();
                                            const existing = targetCircle.querySelector('.card:not(.opponent-card)');
                                            if (existing) {
                                                const drop = document.querySelector('.my-side .drop-zone');
                                                drop.appendChild(existing);
                                                existing.classList.remove('rest');
                                                sendMoveData(existing);
                                            }
                                            targetCircle.appendChild(target);
                                            target.classList.remove('rest');
                                            applyStaticBonuses(target);
                                            sendMoveData(target);
                                            updateDropCount();
                                            document.body.classList.remove('targeting-mode');
                                            document.removeEventListener('click', halbeListener, true);
                                            alert(`Halbe: คอลลงแถวหลังสำเร็จ!`);
                                            await checkOnPlaceAbilities(target);
                                            halbeRes();
                                        } else {
                                            alert("เลือกได้เฉพาะช่องแถวหลังเท่านั้น!");
                                        }
                                    }
                                };
                                document.addEventListener('click', halbeListener, true);
                            });
                        }
                    }

                    if (selectedCount >= count) {
                        document.body.classList.remove('targeting-mode');
                        document.removeEventListener('click', handler, true);
                        resolve(true);
                    }
                }
            };
            document.addEventListener('click', handler, true);
        });
        return result;
    }

    function promptCallSpecificFromSoul(cardToCall) {
        if (!cardToCall) return;
        const inSoul = soulPool.find(c => c.id === cardToCall.id);
        if (inSoul) {
            const idx = soulPool.indexOf(inSoul);
            soulPool.splice(idx, 1);
            alert("เลือก RC เพื่อคอลยูนิท");
            document.body.classList.add('targeting-mode');
            const handler = (e) => {
                const circle = e.target.closest('.my-side .circle.rc');
                if (circle) {
                    e.stopPropagation();
                    if (circle.querySelector('.card')) {
                        const old = circle.querySelector('.card');
                        soulPool.push(old);
                        sendMoveData(old, 'soul');
                        old.remove();
                    }
                    circle.appendChild(inSoul);
                    inSoul.classList.remove('rest');
                    updateSoulUI();
                    sendMoveData(inSoul);
                    document.body.classList.remove('targeting-mode');
                    document.removeEventListener('click', handler, true);
                    alert(`${inSoul.dataset.name} called to RC!`);
                }
            };
            document.addEventListener('click', handler, true);
        }
    }

    function promptRichardVC(onComplete) {
        const rgs = document.querySelectorAll('.my-side .circle.rc .card:not(.opponent-card)');
        if (rgs.length === 0) {
            alert("No Rear-guards to pay the cost! Ability failed.");
            if (onComplete) onComplete();
            return;
        }

        alert("Select 1 of your Rear-guards to put into Soul.");
        document.body.classList.add('targeting-mode');

        const selectionHandler = (e) => {
            const rg = e.target.closest('.circle.rc .card:not(.opponent-card)');
            if (rg) {
                e.stopPropagation();
                soulPool.push(rg);
                // Important: sendMoveData while it's in soulPool but before DOM removal might not work perfectly because
                // sendMoveData check parentZone first.
                // Better: Explicitly send it.
                sendMoveData(rg, 'soul');
                rg.remove();
                updateSoulUI();
                syncCounts(); // Still good to sync totals
                document.body.classList.remove('targeting-mode');
                document.removeEventListener('click', selectionHandler, true);

                alert("Cost paid! Draw 1 card.");
                drawCard(true);
                if (onComplete) onComplete();
            }
        };
        document.addEventListener('click', selectionHandler, true);
    }

    // Consolidated soulCharge into one version at the start of original script section

    async function promptCallMultipleFromSoul(maxCount, message, filterFn = null, callCount = 0) {
        if (callCount >= maxCount || soulPool.length === 0) return;
        const openRCs = Array.from(document.querySelectorAll('.my-side .circle.rc')).filter(circle => !circle.querySelector('.card'));
        if (openRCs.length === 0) return;

        let displayPool = filterFn ? soulPool.filter(filterFn) : soulPool;
        if (displayPool.length === 0) {
            alert("No valid cards in Soul to call!");
            return;
        }

        const nameToDisplay = callCount === 0 ? "1st" : (callCount === 1 ? "2nd" : (callCount === 2 ? "3rd" : `${callCount + 1}th`));
        if (await vgConfirm(`${message}: [${nameToDisplay} Card] คุณต้องการคอลยูนิทจากโซลหรือไม่?`)) {
            await new Promise(resolve => {
                promptSoulCall(true, resolve, filterFn); // isSelective=true, callback=resolve, filterFn
            });
            await promptCallMultipleFromSoul(maxCount, message, filterFn, callCount + 1); // Recursive call
        }
    }

    // Consolidated selective soul call with optionality and callback
    function promptSoulCall(isSelective = false, onComplete, filterFn = null) {
        if (soulPool.length === 0) {
            alert("Soul is empty!");
            if (onComplete) onComplete();
            return;
        }
        let displayPool = filterFn ? soulPool.filter(filterFn) : soulPool;
        if (displayPool.length === 0) {
            alert("No valid cards in Soul to call based on filter!");
            if (onComplete) onComplete();
            return;
        }

        openViewer("Select 1 card to CALL from Soul", displayPool);

        const selectionHandler = (e) => {
            const clicked = e.target.closest('.card');
            if (clicked && clicked.parentElement === viewerGrid) {
                const originalId = clicked.dataset.originalId;
                const originalIndex = soulPool.findIndex(c => c.id === originalId);

                if (originalIndex !== -1) {
                    const card = soulPool.splice(originalIndex, 1)[0];
                    zoneViewer.classList.add('hidden');
                    viewerGrid.removeEventListener('click', selectionHandler);

                    alert("Select an empty Rear-guard Circle to call.");
                    document.body.classList.add('targeting-mode');

                    const callHandler = (ev) => {
                        const circle = ev.target.closest('.circle.rc');
                        if (circle && !circle.querySelector('.card')) { // Ensure circle is empty
                            ev.stopPropagation();
                            if (circle.querySelector('.card')) { // This should not happen if filtered for empty, but as a safeguard
                                const old = circle.querySelector('.card:not(.opponent-card)');
                                if (old) {
                                    soulPool.push(old);
                                    sendMoveData(old, 'soul');
                                    old.remove();
                                }
                            }
                            circle.appendChild(card);
                            card.classList.remove('rest');
                            card.style.transform = 'none';
                            applyStaticBonuses(card); // Apply bonuses to the newly called card
                            sendMoveData(card);
                            updateSoulUI();
                            document.body.classList.remove('targeting-mode');
                            document.removeEventListener('click', callHandler, true);
                            alert(`${card.dataset.name} called from Soul!`);
                            if (onComplete) onComplete();
                        } else if (circle) {
                            alert("That circle is not empty! Please select an empty RC.");
                        }
                    };
                    document.addEventListener('click', callHandler, true);
                }
            }
        };
        viewerGrid.addEventListener('click', selectionHandler);
    }

    function promptDropToSoul() {
        const dropCards = Array.from(document.querySelectorAll('.my-side .drop-zone .card:not(.opponent-card)'));
        if (dropCards.length === 0) {
            alert("Drop Zone is empty!");
            return;
        }
        openViewer("Select 1 card to put into Soul", dropCards);

        const selectionHandler = (e) => {
            const clicked = e.target.closest('.card');
            if (clicked && clicked.parentElement === viewerGrid) {
                const originalId = clicked.dataset.originalId;
                const card = document.getElementById(originalId);
                if (card) {
                    soulPool.push(card);
                    card.remove();
                    zoneViewer.classList.add('hidden');
                    updateSoulUI();
                    updateDropCount();
                    sendData({ type: 'syncSoulCount', count: soulPool.length });
                    alert("Card moved to Soul.");
                    viewerGrid.removeEventListener('click', selectionHandler);
                }
            }
        };
        viewerGrid.addEventListener('click', selectionHandler);
    }

    function promptTopDeckCall(count, maxGrade) {
        const top5 = deckPool.slice(-count).reverse();
        if (top5.length === 0) return;

        // Show cards in viewer
        const tempCards = top5.map(data => createCardElement(data));
        openViewer(`Top ${count}: Select G${maxGrade} or lower`, tempCards);

        const selectionHandler = (e) => {
            const clicked = e.target.closest('.card');
            if (clicked && clicked.parentElement === viewerGrid) {
                if (parseInt(clicked.dataset.grade) > maxGrade) {
                    alert(`Choose a card with Grade ${maxGrade} or lower.`);
                    return;
                }

                const cardName = clicked.dataset.name;
                const deckIdx = deckPool.findLastIndex(c => c.name === cardName);
                if (deckIdx !== -1) {
                    const cardData = deckPool.splice(deckIdx, 1)[0];
                    zoneViewer.classList.add('hidden');
                    viewerGrid.removeEventListener('click', selectionHandler);
                    updateDeckCounter();

                    const card = createCardElement(cardData);
                    alert(`เรียก ${cardData.name}! โปรดเลือกช่อง RC ที่ว่างอยู่`);

                    document.body.classList.add('targeting-mode');
                    const call = (ev) => {
                        const circle = ev.target.closest('.circle.rc');
                        if (circle && !circle.querySelector('.card')) {
                            ev.stopPropagation();
                            circle.appendChild(card);
                            sendMoveData(card);
                            document.body.classList.remove('targeting-mode');
                            document.removeEventListener('click', call, true);

                            deckPool.sort(() => 0.5 - Math.random());
                            updateDeckCounter();
                        }
                    };
                    document.addEventListener('click', call, true);
                }
            }
        };
        viewerGrid.addEventListener('click', selectionHandler);
    }

    // Placeholder for checkBruceBattleAbility, assuming it exists elsewhere or will be added.
    // Bruce Final Burst Trigger
    async function checkBruceBattleAbility() {
        if (isFinalRush && !isFinalBurst) {
            if (await vgConfirm("Bruce: เข้าสู่ Final Burst?")) {
                isFinalBurst = true;
                alert("Bruce: FINAL BURST activated!");
                updateFinalRushStaticBonuses(true);
                sendData({ type: 'bruceStatus', isFinalRush: true, isFinalBurst: true });
            }
        }
    }

    function updateFinalRushStaticBonuses(apply) {
        document.querySelectorAll('.my-side .circle .card:not(.opponent-card)').forEach(card => {
            applyStaticBonuses(card);
        });
    }

    // Alias so that updateAllStaticBonuses() works (called in Stand Phase reset)
    function updateAllStaticBonuses() {
        updateFinalRushStaticBonuses(true);
    }

    // Show a modal to let the player pick which column to restand (left / center / right)
    function showColumnSelection(callback) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.zIndex = '999999';
        overlay.innerHTML = `
            <div class="modal-content glass-panel" style="width: 90%; max-width: 420px; text-align: center; padding: 2rem; background: rgba(15, 15, 25, 0.95); border: 2px solid var(--accent-vanguard); border-radius: 20px; box-shadow: 0 0 30px rgba(255, 42, 109, 0.5); font-family: 'Orbitron', sans-serif;">
                <h3 style="color: var(--accent-vanguard); margin-top: 0; margin-bottom: 15px; font-size: 1.3rem; text-shadow:0 0 10px #f00;">SELECT COLUMN TO STAND</h3>
                <p style="color: white; font-size: 1rem; margin-bottom: 20px; font-family: sans-serif;">เลือกคอลัมน์ที่ต้องการสแตน</p>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button class="col-pick-btn glass-btn" data-col="left" style="flex: 1; padding: 1rem; background: rgba(0,200,255,0.15); border: 1px solid #0cf; color: #0cf; font-size: 1rem; cursor: pointer; border-radius: 12px; font-weight: bold;">⬅ LEFT</button>
                    <button class="col-pick-btn glass-btn" data-col="center" style="flex: 1; padding: 1rem; background: rgba(255,200,0,0.15); border: 1px solid #fc0; color: #fc0; font-size: 1rem; cursor: pointer; border-radius: 12px; font-weight: bold;">⬆ CENTER</button>
                    <button class="col-pick-btn glass-btn" data-col="right" style="flex: 1; padding: 1rem; background: rgba(0,255,100,0.15); border: 1px solid #0f6; color: #0f6; font-size: 1rem; cursor: pointer; border-radius: 12px; font-weight: bold;">RIGHT ➡</button>
                </div>
                <button class="col-cancel-btn glass-btn" style="margin-top: 15px; padding: 0.7rem 2rem; background: rgba(255,255,255,0.05); color: #aaa; border: 1px solid #444; font-size: 0.9rem; cursor: pointer;">CANCEL</button>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelectorAll('.col-pick-btn').forEach(btn => {
            btn.onclick = () => {
                overlay.remove();
                if (callback) callback(btn.dataset.col);
            };
        });
        overlay.querySelector('.col-cancel-btn').onclick = () => {
            overlay.remove();
            if (callback) callback(null);
        };
    }

    // Restand all cards in the chosen column and give each +5000 power
    function restandColumn(col) {
        if (!col) return;
        let zones = [];
        if (col === 'left') zones = ['rc_front_left', 'rc_back_left'];
        else if (col === 'right') zones = ['rc_front_right', 'rc_back_right'];
        else if (col === 'center') zones = ['vc', 'rc_back_center'];

        let stoodCount = 0;
        zones.forEach(z => {
            const circle = document.querySelector(`.my-side .circle[data-zone="${z}"]`);
            if (circle) {
                const card = circle.querySelector('.card:not(.opponent-card)');
                if (card) {
                    // Stand the unit
                    card.classList.remove('rest');
                    card.dataset.stoodByEffect = "true";
                    // Give +5000 power
                    card.dataset.power = parseInt(card.dataset.power || 0) + 5000;
                    syncPowerDisplay(card);
                    sendMoveData(card);
                    stoodCount++;
                }
            }
        });

        if (stoodCount > 0) {
            alert(`FINAL BURST: ${col.toUpperCase()} column restood! +5000 Power to ${stoodCount} unit(s)!`);
        } else {
            alert(`No units found in ${col} column.`);
        }
    }

    function resetMyUnits() {
        console.log("Resetting unit power/critical for new turn...");
        personaRideActive = false; // Reset Persona Ride
        isOpponentPersonaRide = false;
        window.seraphCostReduction = false; // Reset Seraph Cost Reduction
        document.querySelectorAll('.my-side .circle .card:not(.opponent-card), .my-side .vc .card:not(.opponent-card)').forEach(c => {
            // Clean up all persistent skill flags
            const flags = [
                'stoodByEffect', 'frBonusApplied', 'meganBuffed', 'edenCritApplied', 'burstBonusApplied',
                'burstFrontBuffApplied', 'personaBuffed', 'julianUsed', 'elderBuffed', 'winnsapoohPlacedBuff',
                'enpixBackBuffed', 'bojalcornActive', 'gabrestrict', 'alpinBindReady', 'goildoatRetireReady',
                'stefanieBuffed', 'baurPwrAdded', 'baurDriveCheck', 'baurDriveUsed', 'killshroudDebuffApplied',
                'shockCritApplied', 'strategyPowerBuffed', 'dustingBuffApplied',
                'drive', 'avantStandReady', 'avantSkillPowerBuffed', 'turnEndBuffActive', 'turnEndBuffPower',
                'actUsed', 'fromHand', 'asagiBonusApplied', 'avantSkillBuffApplied', 'killshroudPowerBuffApplied',
                'darkBonusApplied', 'majestyBonusApplied', 'maronBonusApplied', 'ordealBonusApplied',
                'findanisBonusApplied', 'otDarkStatesActiveBuff', 'otStoicheiaBuff', 'turnEndBuffApplied',
                'killshroudDebuffApplied', 'vilsXoverBuffed', 'garouXoverBuffed', 'sequanaBuffApplied',
                'doteStandUsed', 'onHitTargetUsed', 'doteSoulBonusApplied', 'nehalemCONTApplied',
                'mousheenImmune', 'saasyouBuffApplied', 'dragontreeBuffApplied', 'cleanSweepUsedThisTurn',
                'seraphBuffApplied', 'purelightBuffApplied', 'penetrateBuffApplied', 'lifleBuffApplied', 'munaBuffApplied',
                'greedonSoulBonusApplied', 'purelightPower', 'purelightCrit', 'aquasBuffApplied'
            ];
            flags.forEach(flag => delete c.dataset[flag]);

            // Reset power and critical to base values
            c.dataset.power = c.dataset.basePower;
            c.dataset.critical = c.dataset.baseCritical;
            syncPowerDisplay(c);
        });
    }

    function promptReturnToHand() {
        const handCards = Array.from(playerHand.querySelectorAll('.card'));
        openViewer("Select a card to return to hand", handCards);
        const sel = (e) => {
            const clicked = e.target.closest('.card');
            if (clicked && clicked.parentElement === viewerGrid) {
                viewerGrid.removeEventListener('click', sel);
                zoneViewer.classList.add('hidden');

                const realCard = document.getElementById(clicked.id);
                if (realCard) {
                    playerHand.appendChild(realCard);
                    updateHandCount();
                    updateDropCount();
                    sendMoveData(realCard);
                    alert(`Returned ${clicked.dataset.name} to hand!`);
                }
            }
        };
        viewerGrid.addEventListener('click', sel);
    }

    function promptLookTop5ForStrategy() {
        const top5 = deckPool.slice(0, 5);
        openViewer("Asagi Milestone: Top 5", top5);
        const sel = (e) => {
            const clicked = e.target.closest('.card');
            if (clicked && clicked.parentElement === viewerGrid) {
                if (clicked.dataset.name.includes('Strategy')) {
                    viewerGrid.removeEventListener('click', sel);
                    zoneViewer.classList.add('hidden');
                    const id = clicked.dataset.originalId;
                    const originalIdx = deckPool.findIndex(c => c.id === id);
                    const chosenData = deckPool.splice(originalIdx, 1)[0];
                    const chosenElem = createCardElement(chosenData);
                    playerHand.appendChild(chosenElem);
                    updateHandSpacing();
                    sendMoveData(chosenElem);
                    alert(`นำ Strategy: ${clicked.dataset.name} ขึ้นมือ!`);
                    deckPool.sort(() => 0.5 - Math.random());
                    updateDeckCounter();
                }
            }
        };
        viewerGrid.addEventListener('click', sel);
        const closeH = () => {
            deckPool.sort(() => 0.5 - Math.random());
            updateDeckCounter();
            closeViewerBtn.removeEventListener('click', closeH);
        };
        closeViewerBtn.addEventListener('click', closeH);
    }
    function promptSearchAndCall(cardName) {
        const matches = deckPool.filter(c => c.name.includes(cardName));
        if (matches.length === 0) {
            alert(`ไม่พบ ${cardName} ในกองการ์ด!`);
            return;
        }

        openViewer(`Select 1 ${cardName} to CALL`, matches);

        const selHandler = (e) => {
            const clicked = e.target.closest('.card');
            if (clicked && clicked.parentElement === viewerGrid) {
                const targetName = clicked.dataset.name;
                const idx = deckPool.findIndex(c => c.name === targetName);
                if (idx !== -1) {
                    const cardData = deckPool.splice(idx, 1)[0];
                    zoneViewer.classList.add('hidden');
                    viewerGrid.removeEventListener('click', selHandler);

                    const card = createCardElement(cardData);
                    alert(`เลือกช่อง RC ที่ว่างอยู่เพื่อคอล ${cardData.name}`);
                    document.body.classList.add('targeting-mode');

                    const callHandler = (ev) => {
                        const circle = ev.target.closest('.circle.rc');
                        if (circle && !circle.querySelector('.card')) {
                            ev.stopPropagation();
                            circle.appendChild(card);
                            card.classList.remove('rest');
                            card.style.transform = 'none';
                            applyStaticBonuses(card);
                            sendMoveData(card);
                            document.body.classList.remove('targeting-mode');
                            document.removeEventListener('click', callHandler, true);
                            alert(`คอล ${cardData.name} สำเร็จ!`);

                            deckPool.sort(() => 0.5 - Math.random());
                            updateDeckCounter();
                        } else if (circle) {
                            alert("ช่องนั้นไม่ว่าง! กรุณาเลือกช่อง RC ที่ว่าง");
                        }
                    };
                    document.addEventListener('click', callHandler, true);
                }
            }
        };
        viewerGrid.addEventListener('click', selHandler);
    }

    function promptSearchAndAddHand(filterFn, title = "Select a card to add to Hand") {
        const matches = deckPool.filter(filterFn);
        if (matches.length === 0) {
            alert("ไม่พบการ์ดที่ต้องการในกองการ์ด!");
            return;
        }

        openViewer(title, matches);

        const selHandler = (e) => {
            const clicked = e.target.closest('.card');
            if (clicked && clicked.parentElement === viewerGrid) {
                const targetName = clicked.dataset.name;
                const idx = deckPool.findIndex(c => c.name === targetName);
                if (idx !== -1) {
                    const cardData = deckPool.splice(idx, 1)[0];
                    zoneViewer.classList.add('hidden');
                    viewerGrid.removeEventListener('click', selHandler);

                    const card = createCardElement(cardData);
                    playerHand.appendChild(card);
                    updateHandSpacing();
                    sendMoveData(card);
                    updateDeckCounter();
                    alert(`นำ ${cardData.name} ขึ้นมือ!`);

                    deckPool.sort(() => 0.5 - Math.random());
                    updateDeckCounter();
                }
            }
        };
        viewerGrid.addEventListener('click', selHandler);
    }

    function promptMajestyLookTop7(done) {
        if (deckPool.length === 0) { if (done) done(); return; }
        const top7 = [];
        for (let i = 0; i < 7; i++) {
            if (deckPool.length > 0) top7.push(deckPool.pop());
        }
        updateDeckCounter();

        openViewer("Top 7 Cards (Select Grade 2 'Blaster' to hand)", top7);

        let revealed = false;
        const sel = (e) => {
            const clicked = e.target.closest('.card');
            if (clicked && clicked.parentElement === viewerGrid) {
                const name = clicked.dataset.name;
                const grade = parseInt(clicked.dataset.grade);
                if (name.includes('Blaster') && grade === 2) {
                    revealed = true;
                    viewerGrid.removeEventListener('click', sel);
                    zoneViewer.classList.add('hidden');

                    const idx = top7.findIndex(c => c.name === name);
                    const chosen = top7.splice(idx, 1)[0];
                    const cardNode = createCardElement(chosen);
                    playerHand.appendChild(cardNode);
                    updateHandSpacing();
                    sendMoveData(cardNode);
                    alert(`นำ ${chosen.name} ขึ้นมือ!`);

                    deckPool.push(...top7);
                    deckPool.sort(() => 0.5 - Math.random());
                    updateDeckCounter();
                    if (done) done();
                } else {
                    alert("ต้องเป็นเกรด 2 ที่มีชื่อ 'Blaster' เท่านั้น!");
                }
            }
        };
        viewerGrid.addEventListener('click', sel);

        const closeH = () => {
            if (!revealed) {
                deckPool.push(...top7);
                deckPool.sort(() => 0.5 - Math.random());
                updateDeckCounter();

                vgConfirm("ไม่ได้นำการ์ดขึ้นมือ ต้องการคอล 'Wingul Brave' จากโซลหรือไม่?").then(res => {
                    if (res) {
                        promptCallFromSoulByName('Wingul Brave');
                    }
                    if (done) done();
                });
            }
            closeViewerBtn.removeEventListener('click', closeH);
        };
        closeViewerBtn.addEventListener('click', closeH);
    }

    function promptMajestyRetireOrDraw(done) {
        const oppRGs = Array.from(document.querySelectorAll('.opponent-side .circle.rc .card'));
        const validTargets = oppRGs.filter(c => !isCardResistant(c));

        if (validTargets.length > 0) {
            alert("เลือกเรียร์การ์ดคู่แข่ง 1 ใบเพื่อรีไทร์");
            document.body.classList.add('targeting-mode');
            const h = (e) => {
                const t = e.target.closest('.opponent-side .circle.rc .card');
                if (t) {
                    if (isCardResistant(t)) {
                        alert("ยูนิทนี้มี Resist! ไม่สามารถเลือกได้");
                        return;
                    }
                    e.stopPropagation();
                    const oppDrop = document.querySelector('.opponent-side .drop-zone');
                    oppDrop.appendChild(t);
                    sendMoveData(t);
                    alert("รีไทร์เรียร์การ์ดคู่แข่งสำเร็จ!");
                    card.dataset.actUsed = "true";
                    document.body.classList.remove('targeting-mode');
                    document.removeEventListener('click', h, true);
                    if (done) done();
                }
            };
            document.addEventListener('click', h, true);
        } else {
            alert("คู่แข่งไม่มีเรียร์การ์ดให้รีไทร์! ทำการจั่วการ์ด 1 ใบแทน");
            drawCard(true);
            if (done) done();
        }
    }

    function promptCallFromSoulByName(targetName) {
        const soulIdx = soulPool.findIndex(c => c.dataset.name === targetName);
        if (soulIdx !== -1) {
            const card = soulPool.splice(soulIdx, 1)[0];
            alert(`เลือกช่อง RC ที่ว่างอยู่เพื่อคอล ${targetName}`);
            document.body.classList.add('targeting-mode');
            const h = (e) => {
                const circle = e.target.closest('.circle.rc');
                if (circle && !circle.querySelector('.card')) {
                    e.stopPropagation();
                    circle.appendChild(card);
                    card.classList.remove('rest');
                    applyStaticBonuses(card);
                    sendMoveData(card);
                    updateSoulUI();
                    document.body.classList.remove('targeting-mode');
                    document.removeEventListener('click', h, true);
                }
            };
            document.addEventListener('click', h, true);
        } else {
            alert(`ไม่พบ ${targetName} ในโซล!`);
        }
    }

    function promptLookTop7ForPrayerDragon() {
        if (deckPool.length === 0) return;
        const top7 = [];
        for (let i = 0; i < 7; i++) {
            if (deckPool.length > 0) top7.push(deckPool.pop());
        }
        updateDeckCounter();

        openViewer("Top 7 Cards (Select <Prayer Dragon> to add to hand)", top7);

        const sel = (e) => {
            const clicked = e.target.closest('.card');
            if (clicked && clicked.parentElement === viewerGrid) {
                const name = clicked.dataset.name;
                const isPD = name.includes('Equip Dragon');
                if (isPD) {
                    const idx = top7.findIndex(c => c.name === name);
                    const chosen = top7.splice(idx, 1)[0];
                    zoneViewer.classList.add('hidden');
                    viewerGrid.removeEventListener('click', sel);

                    const cardNode = createCardElement(chosen);
                    playerHand.appendChild(cardNode);
                    updateHandSpacing();
                    sendMoveData(cardNode);
                    alert(`เพิ่ม ${chosen.name} ขึ้นมือ!`);

                    deckPool.push(...top7);
                    deckPool.sort(() => 0.5 - Math.random());
                    updateDeckCounter();
                } else {
                    alert("ต้องเป็น <Prayer Dragon> (Equip Dragon) เท่านั้น!");
                }
            }
        };
        viewerGrid.addEventListener('click', sel);
    }

    // --- Rock Paper Scissors ---
    let rpsDecided = false;
    let rpsResendInterval = null;

    function startRPS() {
        const overlay = document.getElementById('rps-overlay');
        const options = document.getElementById('rps-options');
        const status = document.getElementById('rps-status');

        rpsDecided = false;
        myRpsChoice = null;
        oppRpsChoice = null;
        if (rpsResendInterval) clearInterval(rpsResendInterval);

        overlay.classList.remove('hidden');
        options.classList.remove('hidden');
        status.textContent = "Choose your move!";

        document.querySelectorAll('.rps-btn').forEach(btn => {
            btn.onclick = () => {
                myRpsChoice = btn.dataset.choice;
                options.classList.add('hidden');
                status.textContent = "Waiting for Rival's choice...";
                sendData({ type: 'rpsChoice', choice: myRpsChoice });

                // Resend mechanism in case packet drops
                rpsResendInterval = setInterval(() => {
                    if (myRpsChoice && !oppRpsChoice) {
                        sendData({ type: 'rpsChoice', choice: myRpsChoice });
                    }
                }, 1000);

                checkRpsResult();
            };
        });

        // Check if opponent already sent their choice
        checkRpsResult();
    }

    function checkRpsResult() {
        if (!myRpsChoice || !oppRpsChoice || rpsDecided) return;
        rpsDecided = true;
        if (rpsResendInterval) clearInterval(rpsResendInterval);

        const resultText = document.getElementById('rps-result-text');
        const myPickDisplay = document.getElementById('my-rps-pick');
        const oppPickDisplay = document.getElementById('opp-rps-pick');
        const rpsResultUI = document.getElementById('rps-result');
        const status = document.getElementById('rps-status');

        status.textContent = "RESULTS";
        rpsResultUI.classList.remove('hidden');

        const symbols = { rock: '✊', paper: '✋', scissors: '✌️' };
        myPickDisplay.textContent = symbols[myRpsChoice];
        oppPickDisplay.textContent = symbols[oppRpsChoice];

        let result = ""; // tie, win, lose
        if (myRpsChoice === oppRpsChoice) {
            result = "tie";
            resultText.textContent = "IT'S A TIE! REPLAYING...";

            setTimeout(() => {
                rpsResultUI.classList.add('hidden');
                startRPS();
            }, 2000);
        } else if (
            (myRpsChoice === 'rock' && oppRpsChoice === 'scissors') ||
            (myRpsChoice === 'paper' && oppRpsChoice === 'rock') ||
            (myRpsChoice === 'scissors' && oppRpsChoice === 'paper')
        ) {
            result = "win";
            resultText.textContent = "YOU WIN! YOU GO FIRST.";
            isFirstPlayer = true;
            window.isFirstPlayer = true;
            isMyTurn = true;
            setTimeout(() => startMulligan(), 2500);
        } else {
            result = "lose";
            resultText.textContent = "YOU LOSE! YOU GO SECOND.";
            isFirstPlayer = false;
            window.isFirstPlayer = false;
            isMyTurn = false;
            setTimeout(() => startMulligan(), 2500);
        }
    }

    // --- Mulligan ---
    function startMulligan() {
        document.getElementById('rps-overlay').classList.add('hidden');
        const overlay = document.getElementById('mulligan-overlay');
        const grid = document.getElementById('mulligan-grid');
        overlay.classList.remove('hidden');
        grid.innerHTML = '';

        // Draw initial 5
        // Use existing deckPool to preserve unique IDs assigned in initGame
        deckPool.sort(() => 0.5 - Math.random());
        const initialHand = deckPool.splice(0, 5);

        initialHand.forEach(cardData => {
            const cardElem = createCardElement(cardData);
            cardElem.classList.add('mulligan-card');
            cardElem.draggable = false; // Prevent dragging during mulligan
            cardElem.onclick = () => cardElem.classList.toggle('to-mulligan');
            grid.appendChild(cardElem);
        });

        document.getElementById('confirm-mulligan-btn').onclick = () => {
            const toReturn = Array.from(grid.querySelectorAll('.card.to-mulligan'));
            const keep = Array.from(grid.querySelectorAll('.card:not(.to-mulligan)'));

            // Return to deck
            toReturn.forEach(node => {
                deckPool.push(JSON.parse(node.dataset.cardData));
            });
            deckPool.sort(() => 0.5 - Math.random());
            updateDeckCounter();

            // Clear hand area and grid
            playerHand.innerHTML = '';

            // Draw new cards
            const newCardsCount = toReturn.length;
            const finalCards = keep.map(node => JSON.parse(node.dataset.cardData));

            for (let i = 0; i < newCardsCount; i++) {
                finalCards.push(deckPool.shift());
            }

            finalCards.forEach(c => {
                const node = createCardElement(c);
                playerHand.appendChild(node);
            });

            overlay.classList.add('hidden');
            grid.innerHTML = ''; // Clear grid to avoid ghost cards
            hasConfirmedMulligan = true;
            sendData({ type: 'mulliganReady' });
            checkGameStart();
        };
    }

    function checkGameStart() {
        if (hasConfirmedMulligan && oppConfirmedMulligan) {
            alert("Both players ready! GAME START!");
            updateHandCount();
            updateHandSpacing();
            updatePhaseUI(false);
            syncCounts(); // Ensure initial counts are synced to opponent
        } else {
            if (!isAIMode) alert("Waiting for Rival to finish Mulligan...");
        }
    }

    // --- Game Navigation ---
    async function updatePhaseUI(broadcast = true) {
        phaseSteps.forEach((step, index) => {
            step.classList.remove('active', 'passed');
            if (index < currentPhaseIndex) step.classList.add('passed');
            else if (index === currentPhaseIndex) step.classList.add('active');
        });

        const mySide = document.querySelector('.my-side');
        const oppSide = document.querySelector('.opponent-side');

        // Determine if it's my turn
        // Determine if it's my turn: First player starts (Odd turns), Second player follows (Even turns)
        isMyTurn = (currentTurn % 2 !== 0 && isFirstPlayer) || (currentTurn % 2 === 0 && !isFirstPlayer);

        // Reset power/critical ONLY at the start of YOUR turn's stand phase
        if (isMyTurn && currentPhaseIndex === 0) { // Stand phase
            // Reset turn-based flags
            hasRiddenThisTurn = false;
            hasDiscardedThisTurn = false;
            hasDrawnThisTurn = false;
            turnAttackCount = 0;
            orderPlayedThisTurn = false;
            ordersPlayedCount = 0;
            maxOrdersPerTurn = 1;
            nextSetOrderFree = false;
            bomberDustingPowerBuff = false;
            bomberDustingNoIntercept = false;
            bomberDustingNoBlitz = false;
            window.myRGRetiredThisTurn = false;
            strategyActivatedThisTurn = false;
            shockStrategyActive = false;
            strategyActivatedCount = 0;
            lastStrategyPutIntoSoulName = "";
            strategyPutToOrderZoneThisTurn = false;
            window.avantRestandUsedThisTurn = false;
            window.richterRideBackUsedThisTurn = false;

            // State expiration check
            if (currentTurn > finalRushTurnLimit && isFinalRush) {
                isFinalRush = false;
                isFinalBurst = false;
                updateStatusUI();
                alert("Bruce: Final Rush state has expired.");
                sendData({ type: 'bruceStatus', isFinalRush: false, isFinalBurst: false });
            }

            resetMyUnits();

            // Re-apply Final Rush bonuses if still active
            updateAllStaticBonuses();

            pendingPowerIncrease = 0;
            pendingCriticalIncrease = 0;
            isWaitingForGuard = false;
            currentAttackResolving = false; // Reset resolution lock on turn start
            const statusText = document.getElementById('game-status-text');
            if (statusText) statusText.textContent = "Network Ready";
            document.body.classList.remove('targeting-mode');
        }

        // Update button interactivity
        nextPhaseBtn.disabled = !isMyTurn;
        nextTurnBtn.disabled = !isMyTurn;
        nextPhaseBtn.style.opacity = isMyTurn ? "1" : "0.5";
        nextTurnBtn.style.opacity = isMyTurn ? "1" : "0.5";

        if (isMyTurn) {
            mySide.classList.remove('side-disabled');
            oppSide.classList.add('side-disabled');
            turnIndicator.textContent = `เทิร์นที่ ${currentTurn} (ตาของคุณ)`;
            turnIndicator.classList.add('pulse');
        } else {
            mySide.classList.add('side-disabled');
            oppSide.classList.remove('side-disabled');
            turnIndicator.textContent = `เทิร์นที่ ${currentTurn} (ตาคู่แข่ง)`;
            turnIndicator.classList.remove('pulse');
        }

        const currentPhaseName = phases[currentPhaseIndex];

        // Automatic Logic for My Turn
        if (isMyTurn) {
            if (currentPhaseName === 'stand') {
                console.log("Auto Phase: Stand");
                document.querySelectorAll('.my-side .circle .card.rest').forEach(c => c.classList.remove('rest'));

                // Auto advance to draw after 1 second
                setTimeout(() => {
                    if (currentPhaseIndex === 0) { // Still in stand
                        currentPhaseIndex++;
                        updatePhaseUI(true);
                    }
                }, 1000);
            } else if (currentPhaseName === 'draw') {
                console.log("Auto Phase: Draw");
                if (!hasDrawnThisTurn) {
                    drawCard();
                    hasDrawnThisTurn = true;
                }

                // Auto advance to ride after 1 second
                setTimeout(() => {
                    if (currentPhaseIndex === 1) { // Still in draw
                        currentPhaseIndex++;
                        updatePhaseUI(true);
                    }
                }, 1000);
            } else if (currentPhaseName === 'battle') {
                // Bruce's Start of Battle Phase Ability
                checkBruceBattleAbility();
            } else if (currentPhaseName === 'end') {
                const endQueue = [];

                // 1. Youthberk RevolDress End Turn Revert
                const revolVG = document.querySelector('.my-side .circle.vc .card');
                if (revolVG && revolVG.dataset.isRevolDressRide === "true") {
                    endQueue.push({
                        name: `RevolForm Revert: ${revolVG.dataset.name}`,
                        description: `เมื่อจบเทิร์น ไรด์ร่างหลักที่มี [RevolDress] จากโซลกลับมาแทนในสภาพ [Rest]`,
                        resolve: async (done) => {
                            const vc = revolVG.parentElement;
                            if (soulPool.length > 0) {
                                // Find a card with Skyfall Arms or [RevolDress] specifically
                                let revolDressIdx = soulPool.findIndex(c => (c.dataset.name || "").includes('Skyfall Arms'));
                                if (revolDressIdx === -1) {
                                    revolDressIdx = soulPool.findIndex(c => (c.dataset.skill || "").includes('[RevolDress]'));
                                }

                                if (revolDressIdx !== -1) {
                                    const skyfall = soulPool.splice(revolDressIdx, 1)[0];
                                    revolVG.remove();
                                    soulPool.push(revolVG);
                                    revolVG.dataset.isRevolDressRide = "false";

                                    vc.appendChild(skyfall);
                                    skyfall.classList.add('rest');
                                    skyfall.style.transform = 'none';

                                    sendMoveData(revolVG, 'soul');
                                    sendMoveData(skyfall);
                                    updateSoulUI();
                                    alert(`RevolDress สิ้นสุดผล: ${revolVG.dataset.name} กลับเข้าโซล และไรด์ ${skyfall.dataset.name} ตัวหลักกลับมาแทนในสภาพ [Rest]`);
                                }
                            }
                            if (done) done();
                        }
                    });
                }

                // 2. Inlet Pulse Dragon [AUTO](RC) End of Turn Ability
                const inletPluseUnits = Array.from(document.querySelectorAll('.my-side .circle.rc .card:not(.opponent-card)'))
                    .filter(c => c.dataset.name.includes('Inlet Pulse Dragon'));

                if (inletPluseUnits.length > 0 && turnAttackCount >= 4) {
                    endQueue.push({
                        name: "Inlet Pulse Dragon: End Turn Skill",
                        description: "[นำยูนิทนี้เข้าโซล] จั่วการ์ด 1 ใบ (ทำพร้อมกันทุกลำ)",
                        resolve: async (done) => {
                            await processInletPulse(inletPluseUnits);
                            if (done) done();
                        }
                    });
                }

                if (endQueue.length > 0) {
                    await resolveAbilityQueue(endQueue);
                }
            }
        }

        if (broadcast) {
            sendData({ type: 'phaseChange', phaseIndex: currentPhaseIndex, isFirstPlayer: isFirstPlayer });
        }

        // AI Mode Setup: Trigger AI loop if it's AI's turn
        if (isAIMode && !isMyTurn && !aiThinking) {
            runAITurn();
        }
    }

    async function aiWait(ms = 1500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function runAITurn() {
        if (!isAIMode || isMyTurn || aiThinking) return;
        aiThinking = true;
        const phase = phases[currentPhaseIndex];
        console.log("AI Thinking... Phase:", phase);

        await aiWait(1000 + Math.random() * 1000);

        try {
            switch (phase) {
                case 'stand':
                    // AI Stand Phase - Reset AI turnly flags
                    console.log("AI Stand Phase");
                    document.querySelectorAll('.opponent-side .circle .card.rest').forEach(c => c.classList.remove('rest'));
                    // Reset AI-specific turn flags if any
                    aiAdvancePhase();
                    break;
                case 'draw':
                    // AI Draw
                    if (aiDeck.length > 0) {
                        aiHand.push(aiDeck.shift());
                        syncAIStateToUI();
                    }
                    aiAdvancePhase();
                    break;
                case 'ride':
                    // AI Ride from Ride Deck
                    if (aiRideDeck.length > 0) {
                        const nextGrade = parseInt(aiRideDeck[0].grade);
                        const currentVG = document.querySelector('.opponent-side .circle.vc .card');
                        const currentGrade = currentVG ? parseInt(currentVG.dataset.grade) : -1;
                        if (nextGrade === currentGrade + 1) {
                            await performAIRide();
                        }
                    } else {
                        // === Persona Ride ===
                        const currentVG = document.querySelector('.opponent-side .circle.vc .card');
                        if (currentVG) {
                            const vgName = currentVG.dataset.name;
                            const vgGrade = parseInt(currentVG.dataset.grade);
                            if (vgGrade >= 3) {
                                const personaIdx = aiHand.findIndex(c => c.name === vgName && parseInt(c.grade) >= 3);
                                if (personaIdx !== -1 && aiHand.length >= 2) {
                                    const personaCard = aiHand.splice(personaIdx, 1)[0];
                                    // Discard 1 card for ride
                                    const discardIdx = aiHand.findIndex(c => !!c.trigger) !== -1 ?
                                        aiHand.findIndex(c => !!c.trigger) : aiHand.length - 1;
                                    const discarded = aiHand.splice(discardIdx, 1)[0];
                                    aiDrop.push(discarded);

                                    // Move old VG to soul
                                    aiSoul.push(currentVG);
                                    currentVG.remove();

                                    // Place new VG
                                    const vc = document.querySelector('.opponent-side .circle.vc');
                                    const newNode = createOpponentCardElement(personaCard);
                                    vc.appendChild(newNode);

                                    // Persona Ride bonus: front row +10000
                                    alert(`AI เพอร์โซน่าไรด์: ${personaCard.name}! แถวหน้าทั้งหมดพลัง +10000!`);
                                    document.querySelectorAll('.opponent-side .circle .card').forEach(u => {
                                        const z = u.parentElement.dataset.zone || '';
                                        if (z === 'vc' || z.includes('front')) {
                                            u.dataset.power = (parseInt(u.dataset.power) + 10000).toString();
                                        }
                                    });
                                    syncAIStateToUI();
                                    await aiWait(1000);
                                }
                            }
                        }
                    }
                    aiAdvancePhase();
                    break;
                case 'main':
                    // AI Main Phase: Call units
                    await processAIDeckLogic('main');
                    await performAIMainPhase();
                    aiAdvancePhase();
                    break;
                case 'battle':
                    // AI Battle Phase: Attack
                    await processAIDeckLogic('battle_start');
                    await performAIBattlePhase();
                    aiAdvancePhase();
                    break;
                case 'end':
                    // AI End Turn
                    await aiEndTurn();
                    break;
            }
        } catch (e) {
            console.error("AI Error:", e);
        } finally {
            aiThinking = false;
            // If it's still AI's turn, proceed to the next phase after a short delay
            if (isAIMode && !isMyTurn) {
                setTimeout(runAITurn, 500);
            }
        }
    }

    function aiAdvancePhase() {
        if (currentPhaseIndex < phases.length - 1) {
            currentPhaseIndex++;
            updatePhaseUI(false); // No need to broadcast in AI mode
        }
    }

    async function aiEndTurn() {
        console.log("AI Ending Turn");
        await aiWait(1000);

        // === AI RevolDress Revert ===
        const revolVG = document.querySelector('.opponent-side .circle.vc .card');
        if (revolVG && revolVG.dataset.isRevolDressRide === 'true') {
            // Find Skyfall Arms in AI soul (it's a DOM node)
            const skyfallIdx = aiSoul.findIndex(c => {
                const name = c.dataset ? (c.dataset.name || '') : (c.name || '');
                return name.includes('Skyfall Arms') || (c.dataset && (c.dataset.skill || '').includes('[RevolDress]'));
            });
            if (skyfallIdx !== -1) {
                const skyfall = aiSoul.splice(skyfallIdx, 1)[0];
                aiSoul.push(revolVG);
                revolVG.dataset.isRevolDressRide = 'false';
                revolVG.remove();

                const vc = document.querySelector('.opponent-side .circle.vc');
                let skyfallNode;
                if (skyfall.nodeType) {
                    skyfallNode = skyfall;
                } else {
                    skyfallNode = createOpponentCardElement(skyfall);
                }
                vc.appendChild(skyfallNode);
                skyfallNode.classList.add('rest');
                alert(`AI RevolDress สิ้นสุด: กลับเป็น ${skyfallNode.dataset.name} ในสภาพ [Rest]`);
            }
        }

        // === Reset all AI unit powers/criticals back to base ===
        document.querySelectorAll('.opponent-side .circle .card').forEach(c => {
            if (c.dataset.basePower) {
                c.dataset.power = c.dataset.basePower;
            }
            c.dataset.critical = '1';
            c.dataset.turnEndBuffActive = 'false';
        });

        // Reset opponent-side status flags
        isOpponentFinalRush = false;
        isOpponentFinalBurst = false;

        syncAIStateToUI();

        currentTurn++;
        currentPhaseIndex = 0;
        updatePhaseUI(false);
    }

    function syncAIStateToUI() {
        if (oppHandCountNum) oppHandCountNum.textContent = aiHand.length;
        if (oppDeckCountNum) oppDeckCountNum.textContent = aiDeck.length;
        if (oppDropCountNum) oppDropCountNum.textContent = aiDrop.length;
        if (oppDamageCountNum) oppDamageCountNum.textContent = aiDamage.length;
        if (oppSoulBadge) {
            if (aiSoul.length > 0) {
                oppSoulBadge.classList.remove('hidden');
                oppSoulBadge.textContent = `Soul: ${aiSoul.length}`;
            } else {
                oppSoulBadge.classList.add('hidden');
            }
        }
    }

    function createOpponentCardElement(cardData) {
        const div = document.createElement('div');
        div.className = 'card opponent-card';
        div.id = `opp-${cardIdCounter++}`;
        div.dataset.name = cardData.name;
        div.dataset.grade = cardData.grade;
        div.dataset.power = cardData.power;
        div.dataset.basePower = cardData.power;
        div.dataset.shield = cardData.shield || "0";
        div.dataset.skill = cardData.skill || "";
        div.dataset.critical = cardData.critical || "1";
        div.dataset.trigger = cardData.trigger || "";
        div.dataset.isPG = cardData.isPG ? "true" : "false";
        div.dataset.persona = cardData.persona ? "true" : "false";
        div.dataset.cardData = JSON.stringify(cardData); // Crucial for skills to work

        const img = document.createElement('img');
        img.src = cardImages[cardData.name] || 'https://via.placeholder.com/150';
        div.appendChild(img);

        const cardName = (cardData.name || "").trim();
        const artUrl = cardData.imageUrl || cardImages[cardName] || '';
        const artText = cardData.name.substring(0, 3).toUpperCase();
        const artStyle = artUrl ? `style="background-image: url('${artUrl}'); background-size: cover; background-position: center;"` : '';
        const artDisplay = artUrl ? '' : artText;
        const triggerIcon = cardData.trigger ? `<div class="card-trigger bg-${cardData.trigger.toLowerCase()}">${cardData.trigger[0]}</div>` : '';
        const personaIcon = cardData.persona ? `<div class="card-persona">Persona</div>` : '';
        const displayPower = cardData.power;
        const displayCritical = parseInt(cardData.critical || "1") > 1 ? `<span style="color:gold;">★${cardData.critical}</span>` : '';

        div.innerHTML = `
            <div class="card-header">
                <span class="card-grade">G${cardData.grade}</span>
                ${triggerIcon}
            </div>
            <div class="card-art" ${artStyle}>${artDisplay}</div>
            ${personaIcon}
            <div class="card-details">
                <span class="card-power">⚔️${displayPower} ${displayCritical}</span>
                <span class="card-shield">🛡️${cardData.shield || 0}</span>
            </div>
        `;

        // Re-append image if needed (but innerHTML replaced it)
        // Wait, the original code used img.src. In createCardElement it uses background-image.
        // I'll stick to the createCardElement style for consistency.

        // --- NEW: Add listeners for Attacking and Skill Viewing in AI Mode ---
        div.addEventListener('click', (e) => {
            const currentTime = new Date().getTime();
            const tapGap = currentTime - (div.lastClickTime || 0);
            div.lastClickTime = currentTime;

            // Double Click for Skill
            if (tapGap < 350 && tapGap > 0) {
                openSkillViewer(div);
                return;
            }

            // Attacking Logic
            if (isMyTurn && phases[currentPhaseIndex] === 'battle' && attackingCard) {
                if (attackingCard !== div) {
                    performAttack(attackingCard, div);
                    attackingCard.classList.remove('attacking-glow');
                    attackingCard = null;
                }
            }
        });

        // Long Press / Context Menu for Skill View
        let lpTimer;
        div.addEventListener('mousedown', () => {
            lpTimer = setTimeout(() => openSkillViewer(div), 1000);
        });
        div.addEventListener('mouseup', () => clearTimeout(lpTimer));
        div.addEventListener('mouseleave', () => clearTimeout(lpTimer));
        div.addEventListener('touchstart', () => {
            lpTimer = setTimeout(() => openSkillViewer(div), 1000);
        }, { passive: true });
        div.addEventListener('touchend', () => clearTimeout(lpTimer));

        div.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            openSkillViewer(div);
        });

        return div;
    }

    async function performAIRide() {
        if (aiHand.length === 0) {
            console.log("AI has no hand to discard for ride!");
            return;
        }

        const nextCard = aiRideDeck.shift();
        const vc = document.querySelector('.opponent-side .circle.vc');
        const oldCard = vc.querySelector('.card');

        // AI Discard for Ride
        // Heuristic: Discard a trigger or the highest grade card if multiple, or a duplicate
        aiHand.sort((a, b) => {
            const aIsTrigger = !!a.trigger;
            const bIsTrigger = !!b.trigger;
            if (aIsTrigger !== bIsTrigger) return bIsTrigger - aIsTrigger; // Discard triggers first
            return parseInt(b.grade || 0) - parseInt(a.grade || 0); // Then higher grade
        });
        const discarded = aiHand.shift();
        const dropZone = document.querySelector('.opponent-side .drop-zone');
        const discardedElem = createOpponentCardElement(discarded);
        dropZone.appendChild(discardedElem);

        if (oldCard) {
            aiSoul.push(oldCard); // In a real implementation we'd store the actual data
            oldCard.remove();
        }
        const newNode = createOpponentCardElement(nextCard);
        vc.appendChild(newNode);
        alert(`AI ไรด์: ${nextCard.name}! (ทิ้งการ์ด 1 ใบเพื่อไรด์จาก Ride Deck)`);
        syncAIStateToUI();
        await handleAIRideAbilities(newNode, oldCard, discarded);
        await aiWait(1000);
    }

    async function handleAIRideAbilities(newVanguard, oldVanguard, discardedCard) {
        if (!newVanguard) return;
        const newName = (newVanguard.dataset.name || "").toLowerCase();
        const oldName = oldVanguard ? (oldVanguard.dataset.name || "").toLowerCase() : "";
        const discName = discardedCard ? (discardedCard.name || "").toLowerCase() : "";

        // 0. G0 Second Player Draw Bonus (AI always goes second)
        if (parseInt(newVanguard.dataset.grade) === 1 && oldVanguard) {
            // The G0 unit was just ridden over - check if AI went second
            if (isFirstPlayer) {
                // isFirstPlayer = player goes first, AI goes second
                if (aiDeck.length > 0) {
                    aiHand.push(aiDeck.shift());
                    alert("AI G0 สกิล: เริ่มทีหลัง จั่วการ์ด 1 ใบ!");
                    syncAIStateToUI();
                    await aiWait(800);
                }
            }
        }

        // 1. Habitable Zone
        if (discName.includes('habitable zone') && aiSoul.length >= 1) {
            aiDrop.push(aiSoul.shift());
            aiDeck.push(discardedCard);
            if (aiDeck.length > 0) aiHand.push(aiDeck.shift());
            alert("AI Habitable Zone: SB1, ได้รับ 1 จั่ว!");
            await aiWait(800);
        }

        // 2. Bruce Ride Line
        if (aiDeckType === 'bruce') {
            if (newName.includes('steve') || newName.includes('richard')) {
                if (aiSoul.length > 0) {
                    aiDrop.push(aiSoul.shift());
                    if (newName.includes('richard') && aiDeck.length > 0) {
                        aiHand.push(aiDeck.shift());
                        alert("AI Richard: SB1, ได้รับ 1 จั่ว!");
                    } else {
                        if (aiDeck.length > 0) aiSoul.push(aiDeck.shift());
                        alert("AI Steve: Soul Charge 1!");
                    }
                    await aiWait(800);
                }
            }
        }

        // 3. Youthberk Ride Line
        if (aiDeckType === 'youthberk') {
            if (newName.includes('determined to break away')) {
                // G1 Youth Skill: SB1 look top 3
                if (aiSoul.length > 0 && aiDeck.length >= 3) {
                    aiDrop.push(aiSoul.shift());
                    const top3 = aiDeck.splice(0, 3);
                    const choice = top3.find(c => c.name.toLowerCase().includes('youthberk') || parseInt(c.grade) <= 2);
                    if (choice) {
                        aiHand.push(choice);
                        alert(`AI Youthberk (G1): ค้นหา ${choice.name} และนำขึ้นมือสำเร็จ!`);
                        const remaining = top3.filter(c => c !== choice);
                        aiDeck.push(...remaining);
                    } else {
                        aiDeck.push(...top3);
                        alert("AI Youthberk (G1): พิจารณาแล้วไม่พบเป้าหมายที่ต้องการ");
                    }
                    await aiWait(800);
                }
            } else if (newName.includes('skyfall arms') || newName.includes('youthberk')) {
                const revolIdx = aiDeck.findIndex(c => c.name.toLowerCase().includes('revolform'));
                if (revolIdx !== -1) {
                    aiHand.push(aiDeck.splice(revolIdx, 1)[0]);
                    alert(`AI ${newName.includes('proto') ? 'Protofall' : 'Skyfall'}: ค้นหา RevolForm ขึ้นมือสำเร็จ!`);
                    if (newName.includes('skyfall arms') && aiHand.length > 0) {
                        aiDrop.push(aiHand.shift());
                    }
                    await aiWait(800);
                }
            }
        }

        // 4. Magnolia Ride Line
        if (aiDeckType === 'magnolia') {
            if (newName.includes('giunosla') && aiSoul.length > 0) {
                aiDrop.push(aiSoul.shift());
                alert("AI Giunosla: SB1!");
                await aiWait(800);
            }
        }

        // 5. Nirvana Jheva Ride Line
        if (aiDeckType === 'nirvana') {
            if (newName.includes('reiyu') && oldName.includes('rino')) {
                const trickIdx = aiDeck.findIndex(c => c.name.toLowerCase().includes('trickstar'));
                if (trickIdx !== -1) {
                    const trick = aiDeck.splice(trickIdx, 1)[0];
                    const emptyRC = [1, 2, 4, 5].find(i => !document.querySelector(`.opponent-side .circle.rc[data-zone="rc${i}"] .card`));
                    if (emptyRC !== undefined) {
                        const circle = document.querySelector(`.opponent-side .circle.rc[data-zone="rc${emptyRC}"]`);
                        circle.appendChild(createOpponentCardElement(trick));
                        alert("AI Reiyu: ค้นหา Trickstar และคอลลง RC สำเร็จ!");
                        await aiWait(800);
                    }
                }
            } else if (newName.includes('nirvana jheva') && oldName.includes('reiyu')) {
                const prayerIdx = aiDeck.findIndex(c => c.name.toLowerCase().includes('prayer dragon') || c.name.toLowerCase().includes('equip'));
                if (prayerIdx !== -1) {
                    aiHand.push(aiDeck.splice(prayerIdx, 1)[0]);
                    alert("AI Nirvana Jheva: ค้นหา Prayer Dragon ขึ้นมือสำเร็จ!");
                    await aiWait(800);
                }
            }
        }

        // 6. Avantgarda Ride Line
        if (aiDeckType === 'avantgarda') {
            const hasSora = aiSoul.some(c => {
                const name = c.dataset ? (c.dataset.name || '') : (c.name || '');
                return name.toLowerCase().includes('sora period');
            });
            if (hasSora) {
                if (newName.includes('stelvane')) {
                    const stratIdx = aiDeck.findIndex(c => c.name.toLowerCase().includes('strategy') && parseInt(c.grade) === 1);
                    if (stratIdx !== -1) {
                        aiHand.push(aiDeck.splice(stratIdx, 1)[0]);
                        alert("AI Stelvane: ค้นหาเกรด 1 Strategy ขึ้นมือสำเร็จ!");
                    } else {
                        const emptyRC = [1, 2, 4, 5].find(i => !document.querySelector(`.opponent-side .circle.rc[data-zone="rc${i}"] .card`));
                        if (emptyRC !== undefined) {
                            const circle = document.querySelector(`.opponent-side .circle.rc[data-zone="rc${emptyRC}"]`);
                            circle.appendChild(createOpponentCardElement(oldVanguard));
                            alert("AI Stelvane: ไม่พบ Strategy, คอล Findanis ลง RC แทน!");
                        }
                    }
                    await aiWait(800);
                } else if (newName.includes('avantgarda')) {
                    const stratIdx = aiDeck.findIndex(c => c.name.toLowerCase().includes('strategy') && parseInt(c.grade) === 2);
                    if (stratIdx !== -1) {
                        aiHand.push(aiDeck.splice(stratIdx, 1)[0]);
                        alert("AI Avantgarda: ค้นหาเกรด 2 Strategy ขึ้นมือสำเร็จ!");
                    } else {
                        const emptyRC = [1, 2, 4, 5].find(i => !document.querySelector(`.opponent-side .circle.rc[data-zone="rc${i}"] .card`));
                        if (emptyRC !== undefined) {
                            const circle = document.querySelector(`.opponent-side .circle.rc[data-zone="rc${emptyRC}"]`);
                            circle.appendChild(createOpponentCardElement(oldVanguard));
                            alert("AI Avantgarda: ไม่พบ Strategy, คอล Stelvane ลง RC แทน!");
                        }
                    }
                    await aiWait(800);
                }
            }
        }

        // 7. Majesty Ride Line
        if (aiDeckType === 'majesty') {
            if (newName.includes('maron') && !isFirstPlayer && aiDeck.length > 0) {
                aiHand.push(aiDeck.shift());
                alert("AI Maron: โบนัสเเริ่มทีหลังสำเร็จ จั่ว 1!");
            } else if (newName.toLowerCase().includes('blaster') && oldName.includes('maron')) {
                const blasterIdx = aiDeck.findIndex(c => c.name.toLowerCase().includes('blaster') && parseInt(c.grade) === 2);
                if (blasterIdx !== -1) {
                    aiHand.push(aiDeck.splice(blasterIdx, 1)[0]);
                    alert("AI Maron: ค้นหา Blaster G2 ขึ้นมือสำเร็จ!");
                } else if (aiSoul.length > 0) {
                    const wingulIdx = aiSoul.findIndex(c => c.name.toLowerCase().includes('wingul'));
                    if (wingulIdx !== -1) {
                        const wingul = aiSoul.splice(wingulIdx, 1)[0];
                        const emptyRC = [1, 2, 4, 5].find(i => !document.querySelector(`.opponent-side .circle.rc[data-zone="rc${i}"] .card`));
                        if (emptyRC !== undefined) {
                            const circle = document.querySelector(`.opponent-side .circle.rc[data-zone="rc${emptyRC}"]`);
                            circle.appendChild(createOpponentCardElement(wingul));
                            alert("AI Maron: คอล Wingul Brave จากโซลสำเร็จ!");
                        }
                    }
                }
                await aiWait(800);
            } else if (newName.includes('blaster blade')) {
                // AI Blaster Blade: Retire one player RG OR Draw 1
                const playerRGs = document.querySelectorAll('.my-side .circle.rc .card');
                if (playerRGs.length > 0 && aiSoul.length >= 1) { // Simple check, suppose CB1 == soul check for AI for now or just generic
                    const target = playerRGs[0];
                    alert(`AI Blaster Blade: รีไทร์ ${target.dataset.name}!`);
                    const dropZone = document.querySelector('.my-side .drop-zone');
                    if (dropZone) dropZone.appendChild(target);
                    sendMoveData(target);
                } else {
                    if (aiDeck.length > 0) aiHand.push(aiDeck.shift());
                    alert("AI Blaster Blade: จั่วการ์ด 1 ใบ!");
                }
                await aiWait(800);
            }
        }

        syncAIStateToUI();
    }

    async function performAIMainPhase() {
        console.log("AI performing Main Phase - Strategic Placement...");

        // --- 1. Ride (handled by separate logic usually, but ensure consistency) ---

        // --- 2. Play Orders ---
        await handleAIOrderPhase();

        const vg = document.querySelector('.opponent-side .circle.vc .card');
        const vgGrade = vg ? parseInt(vg.dataset.grade) : 0;

        // Column mapping: front -> back (opponent side is mirrored)
        const columnPairs = [
            { front: 'rc_front_left', back: 'rc_back_left' },
            { front: 'rc_front_right', back: 'rc_back_right' }
        ];
        // VC column booster
        const vcBoosterZone = 'rc_back_center';

        let calls = 0;
        const maxCalls = aiDifficulty === 'hard' ? 4 : 2;

        const callUnit = async (cardData, targetCircle) => {
            if (!targetCircle || targetCircle.querySelector('.card')) return false;
            const newNode = createOpponentCardElement(cardData);
            targetCircle.appendChild(newNode);
            aiHand.splice(aiHand.indexOf(cardData), 1);
            calls++;
            alert(`AI คอล: ${cardData.name} ลงช่อง ${targetCircle.dataset.zone}`);
            syncAIStateToUI();
            await aiWait(800);
            return true;
        };

        // Step 1: Strategic Call Decision
        const attackers = aiHand.filter(c => {
            const g = parseInt(c.grade);
            const isG3 = g === 3;
            // Strategic Reserve: G3s are kept for next turn's Ride unless we are already G3
            if (isG3 && vgGrade < 3) return false;
            return g >= 2 && g <= vgGrade && !c.trigger && !(c.isPG || (c.skill && c.skill.includes('Perfect Guard')));
        }).sort((a, b) => parseInt(b.power || 0) - parseInt(a.power || 0));

        const boosters = aiHand.filter(c => {
            const g = parseInt(c.grade);
            return g <= 1 && g <= vgGrade && !c.trigger && !(c.isPG || (c.skill && c.skill.includes('Perfect Guard')));
        }).sort((a, b) => parseInt(b.power || 0) - parseInt(a.power || 0));

        // Column Logic: Only call if it creates a strong column (> Player VG Power)
        const playerVG = document.querySelector('.my-side .circle.vc .card');
        const pVGPower = playerVG ? parseInt(playerVG.dataset.power) : 10000;

        for (const col of columnPairs) {
            if (calls >= maxCalls) break;
            const frontCircle = document.querySelector(`.opponent-side .circle[data-zone="${col.front}"]`);
            const backCircle = document.querySelector(`.opponent-side .circle[data-zone="${col.back}"]`);
            
            if (!frontCircle.querySelector('.card') && attackers.length > 0) {
                const attacker = attackers[0];
                const booster = boosters.find(b => parseInt(b.power) + parseInt(attacker.power) >= pVGPower) || boosters[0];
                
                // If even with booster it's weak, and we have few cards, maybe don't call
                if (parseInt(attacker.power) < pVGPower && !booster && attackers.length < 3) continue;

                await callUnit(attackers.shift(), frontCircle);
                if (booster && boosters.includes(booster)) {
                    await callUnit(boosters.splice(boosters.indexOf(booster), 1)[0], backCircle);
                }
            }
        }

        // Step 3: VC booster is high priority if missing
        const bcCircle = document.querySelector(`.opponent-side .circle[data-zone="${vcBoosterZone}"]`);
        if (calls < maxCalls && boosters.length > 0 && bcCircle && !bcCircle.querySelector('.card')) {
            await callUnit(boosters.shift(), bcCircle);
        }

        // Step 4: Strategic Shifting (Moving unit from back to front if front is empty)
        for (const col of columnPairs) {
            const frontCircle = document.querySelector(`.opponent-side .circle[data-zone="${col.front}"]`);
            const backCircle = document.querySelector(`.opponent-side .circle[data-zone="${col.back}"]`);
            const backUnit = backCircle.querySelector('.card');
            
            if (!frontCircle.querySelector('.card') && backUnit && parseInt(backUnit.dataset.grade) >= 2) {
                alert(`AI Shifting: เลื่อน ${backUnit.dataset.name} ขึ้นแถวหน้า`);
                frontCircle.appendChild(backUnit);
                await aiWait(600);
            }
        }

        // Step 5: Fill remaining spots if hard mode
        if (aiDifficulty === 'hard') {
            const remaining = aiHand.filter(c => {
                const g = parseInt(c.grade);
                return g <= vgGrade && !c.trigger && !(c.isPG || (c.skill && c.skill.includes('Perfect Guard')));
            });
            const emptyFront = Array.from(document.querySelectorAll('.opponent-side .front-row .circle.rc')).filter(c => !c.querySelector('.card'));
            const emptyBack = Array.from(document.querySelectorAll('.opponent-side .back-row .circle.rc')).filter(c => !c.querySelector('.card'));
            for (const card of remaining) {
                if (calls >= maxCalls) break;
                const circle = emptyFront.shift() || emptyBack.shift();
                if (circle) await callUnit(card, circle);
            }
        }

        // --- 4. Activate [ACT] Skills ---
        await handleAIActPhase();
    }

    async function handleAIOrderPhase() {
        if (orderPlayedThisTurn || ordersPlayedCount >= maxOrdersPerTurn) return;

        const vg = document.querySelector('.opponent-side .circle.vc .card');
        const vgGrade = vg ? parseInt(vg.dataset.grade) : 0;

        const playableOrders = aiHand.filter(c => {
            const skillLC = (c.skill || "").toLowerCase();
            return skillLC.includes('order]') && parseInt(c.grade) <= vgGrade;
        });

        if (playableOrders.length > 0) {
            const orderData = playableOrders[0];
            await aiPlayOrder(orderData);
        }
    }

    async function aiPlayOrder(cardData) {
        const skillLC = (cardData.skill || "").toLowerCase();
        const isSetOrder = skillLC.includes('set order');

        let targetZone = '';
        if (isSetOrder) targetZone = '.opponent-side .order-zone';
        else targetZone = '.opponent-side .drop-zone';

        const zoneNode = document.querySelector(targetZone);
        if (zoneNode) {
            const cardNode = createOpponentCardElement(cardData);
            zoneNode.appendChild(cardNode);
            aiHand.splice(aiHand.indexOf(cardData), 1);
            orderPlayedThisTurn = true;
            ordersPlayedCount++;
            syncAIStateToUI();
            updateDropCount();
            alert(`AI plays Order: ${cardData.name}`);
            await activateCardSkill(cardNode);
            await aiWait(800);
        }
    }

    async function handleAIActPhase() {
        const aiUnits = Array.from(document.querySelectorAll('.opponent-side .circle .card'));
        for (const unit of aiUnits) {
            const skill = (unit.dataset.skill || "").toLowerCase();
            if (skill.includes('[act]') && unit.dataset.actUsed !== "true") {
                // Heuristic for common AI actions
                const name = unit.dataset.name;
                if (name.includes("Avantgarda") || name.includes("Strategy") || name.includes("Richter") || name.includes("Overlord")) {
                    alert(`AI activates skill of ${name}`);
                    await activateCardSkill(unit);
                    unit.dataset.actUsed = "true";
                    await aiWait(800);
                }
            }
        }
    }

    async function performAIBattlePhase() {
        // === First Turn Attack Restriction ===
        // In Vanguard, the player who goes first cannot attack on turn 1.
        // isFirstPlayer = true means the PLAYER goes first, AI goes second.
        // If isFirstPlayer and currentTurn === 2, AI is on its first turn (turn 2) so it CAN attack.
        // If !isFirstPlayer and currentTurn === 1, AI goes first and CANNOT attack on turn 1.
        if (!isFirstPlayer && currentTurn === 1) {
            alert("AI เป็นผู้เริ่มก่อน ไม่สามารถโจมตีได้ในเทิร์นแรก!");
            return;
        }
        if (isFirstPlayer && currentTurn === 1) {
            // Player goes first on turn 1, AI doesn't have a battle phase on turn 1
            return;
        }

        const attackers = Array.from(document.querySelectorAll('.opponent-side .circle .card:not(.rest)'))
            .filter(c => {
                const zone = c.parentElement.dataset.zone || "";
                // Magnolia Elder lets back row attack
                const isElder = document.querySelector('.opponent-side .circle.vc .card[data-name*="Elder"]');
                return zone.includes('front') || zone === 'vc' || (isElder && zone.includes('back'));
            });

        // Sort: Vanguard first
        attackers.sort((a, b) => {
            const aIsVG = a.parentElement.classList.contains('vc');
            const bIsVG = b.parentElement.classList.contains('vc');
            return bIsVG - aIsVG;
        });

        for (const unit of attackers) {
            if (aiDamage.length >= 6) break;
            await executeAIAttack(unit);
        }

        // Youthberk RevolDress Logic
        if (aiDeckType === 'youthberk') {
            const didRevol = await handleAIRevolDress();
            if (didRevol) {
                const newVG = document.querySelector('.opponent-side .circle.vc .card');
                if (newVG) await executeAIAttack(newVG);
            }
        }
    }

    async function evaluateAIHitResult(attacker, targetId, crit) {
        const target = document.querySelector(`.my-side .circle[data-zone="${targetId}"] .card`);
        if (attacker && target) {
            const finalPower = parseInt(attacker.dataset.power);
            let playerShield = 0;
            let isPG = false;

            if (isAIMode && !isMyTurn) {
                playerShield = window.playerGuardShield || 0;
                isPG = window.playerGuardIsPG || false;
            } else {
                playerShield = parseInt(document.getElementById('gc-shield-display').textContent.split(': ')[1] || "0");
            }

            const playerPower = parseInt(target.dataset.power) + playerShield;
            const isVanguardTarget = targetId === 'vc';

            let isHit = false;
            if (isPG) {
                alert("ATTACK BLOCKED BY PERFECT GUARD!");
                isHit = false;
            } else {
                isHit = finalPower >= playerPower;
                alert(`AI Attack Result: ${finalPower} vs ${playerPower}. Hit: ${isHit}`);
            }

            // --- CRITICAL FIX: Update global/local attack data so skill triggers know it hit ---
            if (currentAttackData) currentAttackData.isHit = isHit;
            attacker.dataset.isHit = isHit ? "true" : "false";

            if (isHit && isVanguardTarget) {
                // Wait for damage to fully complete before continuing
                await processPlayerDamageAndWait(crit);
            } else if (isHit && !isVanguardTarget) {
                alert(`AI destroyed your Rear-guard ${target.dataset.name}!`);
                const dropZone = document.querySelector('.my-side .drop-zone');
                if (dropZone) dropZone.appendChild(target);
                sendMoveData(target);
            }
        }
        // Reset guard flags after each attack resolution
        window.playerGuardShield = 0;
        window.playerGuardIsPG = false;
        isWaitingForGuard = false;
        currentAttackResolving = false;
    }

    // Wrapper that awaits dealDamage completion
    function processPlayerDamageAndWait(count) {
        return new Promise(resolve => {
            alert(`คุณได้รับความเสียหาย ${count} ดาเมจ! เริ่มทำการดาเมจเช็คทีละใบ`);
            dealDamage(count);
            // Poll until dealDamage finishes all checks
            const waitForDamage = setInterval(() => {
                if (!isDealingDamage && !document.body.classList.contains('targeting-mode')) {
                    clearInterval(waitForDamage);
                    setTimeout(resolve, 500); // Small delay after completion
                }
            }, 300);
        });
    }

    async function executeAIAttack(unit) {
        if (unit.classList.contains('rest')) return;

        unit.classList.add('attacking-glow');
        // Show current critical on IA attack
        showPowerPopup(unit, unit.dataset.critical || "1", 'current-crit');
        let totalPower = parseInt(unit.dataset.power);
        let boosterCard = null;

        // === Booster Logic ===
        const unitZone = unit.parentElement.dataset.zone;
        let backZoneName = null;
        if (unitZone === 'rc_front_left') backZoneName = 'rc_back_left';
        else if (unitZone === 'vc') backZoneName = 'rc_back_center';
        else if (unitZone === 'rc_front_right') backZoneName = 'rc_back_right';

        if (backZoneName) {
            const backCircle = document.querySelector(`.opponent-side .circle[data-zone="${backZoneName}"]`);
            if (backCircle) {
                const bCard = backCircle.querySelector('.card:not(.rest)');
                if (bCard) {
                    const bGrade = parseInt(bCard.dataset.grade || "0");
                    const canBoost = bGrade === 0 || bGrade === 1 || bCard.dataset.canBoost === "true";
                    if (canBoost) {
                        const boostPower = parseInt(bCard.dataset.power || "0");
                        totalPower += boostPower;
                        bCard.classList.add('rest');
                        boosterCard = bCard;
                        alert(`AI Boost: ${bCard.dataset.name} (+${boostPower}) บูสต์ให้ ${unit.dataset.name}`);
                    }
                }
            }
        }

        // === Target selection ===
        const playerVG = document.querySelector('.my-side .circle.vc .card');
        const pVGPower = playerVG ? parseInt(playerVG.dataset.power) : 10000;
        
        let target = "vc";
        // Defensive Logic: If we can't hit VG even with booster, try to snipe a Rear-guard
        if (totalPower < pVGPower) {
            const playerRGs = Array.from(document.querySelectorAll('.my-side .front-row .circle.rc .card:not(.opponent-card)'))
                .filter(c => totalPower >= parseInt(c.dataset.power || "0"));
            if (playerRGs.length > 0) {
                // Pick highest grade/power RG as target
                playerRGs.sort((a,b) => parseInt(b.dataset.grade) - parseInt(a.dataset.grade));
                target = playerRGs[0].parentElement.dataset.zone;
            }
        }

        alert(`AI โจมตี ${target === 'vc' ? 'แวนการ์ด' : 'เรียร์การ์ด'} ด้วย ${unit.dataset.name} (พลังรวม: ${totalPower})!`);
        await aiWait(1000);

        window.aiCurrentAttackTarget = target;

        // === Guard Phase - Wait for player to decide ===
        const isVanguardTarget = target === 'vc';
        window.playerGuardShield = 0;
        window.playerGuardIsPG = false;
        isWaitingForGuard = true;
        isGuarding = false;

        await startPlayerGuardPhase(unit, totalPower, isVanguardTarget);

        // Wait until player finishes guarding
        await new Promise(resolve => {
            const checkDone = setInterval(() => {
                if (!isGuarding && !isWaitingForGuard) {
                    clearInterval(checkDone);
                    resolve();
                }
            }, 300);
        });

        // === Drive Check / Hit Check ===
        if (unit.parentElement && unit.parentElement.classList.contains('vc')) {
            const driveCount = unit.dataset.tripleDrive === "true" ? 3 : (parseInt(unit.dataset.grade || "0") >= 3 ? 2 : 1);
            await aiDriveCheck(driveCount, parseInt(unit.dataset.critical || "1"));
        } else {
            await evaluateAIHitResult(unit, target, parseInt(unit.dataset.critical || "1"));
        }

        unit.classList.remove('attacking-glow');
        unit.classList.add('rest');

        // Reset AI unit power back to base after attack resolves
        unit.dataset.power = unit.dataset.basePower || unit.dataset.power;
        unit.dataset.critical = "1";

        await aiWait(800);
    }

    async function startPlayerGuardPhase(attacker, totalPower, isVanguardTarget) {
        const target = isVanguardTarget
            ? document.querySelector('.my-side .circle.vc .card')
            : document.querySelector(`.my-side .circle[data-zone="${window.aiCurrentAttackTarget}"] .card`);
        const attackData = {
            attackerName: attacker.dataset.name,
            attackerId: attacker.id,
            totalPower: totalPower,
            totalCritical: parseInt(attacker.dataset.critical || "1"),
            isVanguardAttacker: attacker.parentElement.classList.contains('vc'),
            targetName: target ? target.dataset.name : (isVanguardTarget ? "Vanguard" : "Rear-guard"),
            targetId: isVanguardTarget ? 'vc' : (window.aiCurrentAttackTarget || 'rc')
        };

        showGuardDecision(attackData);
    }

    nextPhaseBtn.addEventListener('click', async () => {
        if (document.body.classList.contains('targeting-mode')) {
            alert("กรุณาเลือกเป้าหมายให้เสร็จก่อน!");
            return;
        }
        if (currentPhaseIndex < phases.length - 1) {
            currentPhaseIndex++;
            await updatePhaseUI(true);
        }
    });

    nextTurnBtn.addEventListener('click', async () => {
        if (document.body.classList.contains('targeting-mode')) {
            alert("กรุณาเลือกเป้าหมายให้เสร็จก่อน!");
            return;
        }

        // --- NEW: Trigger End Phase abilities before ending turn ---
        if (phases[currentPhaseIndex] !== 'end') {
            currentPhaseIndex = phases.indexOf('end');
            await updatePhaseUI(true);
        }

        // Allow end turn if in End phase even if flags are stuck, or if user forces it
        if ((isWaitingForGuard || currentAttackResolving)) {
            // Safety: If in end phase, or if forced, allow clearing flags
            if (phases[currentPhaseIndex] === 'end') {
                isWaitingForGuard = false;
                currentAttackResolving = false;
                console.log("End turn safety: Forced reset of battle flags.");
            } else {
                alert("กรุณารอให้การต่อสู้จบก่อน!");
                return;
            }
        }
        currentTurn++;
        currentPhaseIndex = 0;
        hasRiddenThisTurn = false;
        hasDiscardedThisTurn = false;
        strategyActivatedThisTurn = false;
        shockStrategyActive = false;
        strategyActivatedCount = 0;
        ordersPlayedCount = 0;
        maxOrdersPerTurn = 1;
        nextSetOrderFree = false;
        bomberDustingPowerBuff = false;
        bomberDustingNoIntercept = false;
        bomberDustingNoBlitz = false;
        lastStrategyPutIntoSoulName = "";
        strategyPutToOrderZoneThisTurn = false;
        window.activeGuardRestrictCount = 0;

        // Reset "Until end of turn" flags
        window.promptedEndTurn = false;
        window.rodeFromG3ThisTurn = false;
        resetMyUnits();

        window.otStoicheiaActive = false;
        window.killshroudDebuffActive = false;
        document.querySelectorAll('.my-side .circle .card').forEach(c => {
            if (c.dataset.turnEndBuffActive === "true") {
                c.dataset.turnEndBuffActive = "false";
            }
            if (c.dataset.avantStandReady === "true") {
                c.dataset.avantStandReady = "false";
            }
            if (c.dataset.deathWindsAttackTrigger === "true") {
                c.dataset.deathWindsAttackTrigger = "false";
            }
            applyStaticBonuses(c);
        });

        await updatePhaseUI(false);
        sendData({ type: 'nextTurn', currentTurn: currentTurn });
    });

    // --- Multiplayer Logic ---
    function initPeer(customId = null) {
        console.log("Initializing PeerJS with STUN/TURN...");

        const peerOptions = {
            config: {
                'iceServers': [
                    { 'urls': 'stun:stun.l.google.com:19302' },
                    { 'urls': 'stun:stun1.l.google.com:19302' },
                    { 'urls': 'stun:stun2.l.google.com:19302' },
                    { 'urls': 'stun:stun3.l.google.com:19302' },
                    { 'urls': 'stun:stun4.l.google.com:19302' },
                    { 'urls': 'stun:global.stun.twilio.com:3478' }
                ]
            }
        };

        if (peer && !peer.destroyed) return;
        if (customId) {
            peer = new Peer(customId, peerOptions);
        } else {
            peer = new Peer(peerOptions);
        }

        peer.on('open', (id) => {
            console.log('Peer ID generated:', id);
            if (role === 'host') {
                if (matchmakingSubtitle) matchmakingSubtitle.textContent = 'Share ID with your friend:';
                if (idDisplayBox) idDisplayBox.classList.remove('hidden');
                if (gamePeerIdDisplay) gamePeerIdDisplay.textContent = id;
            }
            if (gameStatusText) gameStatusText.textContent = 'Network Ready';
            const dot = document.querySelector('.status-dot');
            if (dot) dot.classList.add('online');
        });

        peer.on('connection', (newConn) => {
            console.log("Incoming connection from:", newConn.peer);

            if (gameStarted) {
                console.log("Game already in progress. Ignoring.");
                newConn.close();
                return;
            }

            conn = newConn;
            isHost = true;
            isFirstPlayer = true;

            // Temporary listener to wait for guestJoin
            const waitForJoin = (data) => {
                if (data.type === 'guestJoin') {
                    console.log("Real guest detected! Starting game.");
                    gameStarted = true;
                    conn.off('data', waitForJoin); // Remove this temporary listener

                    const lobbyContent = document.querySelector('.lobby-content');
                    if (lobbyContent) lobbyContent.classList.add('effect-match-found');

                    const deckNameLookup = { bruce: 'bruce', magnolia: 'magnolia', nirvana: 'nirvana', majesty: 'majesty', youthberk: 'youthberk', avantgarda: 'avantgarda', overlord: 'overlord' };
                    let currentDeckName = 'bruce';
                    if (currentDeck === magnoliaDeck) currentDeckName = 'magnolia';
                    else if (currentDeck === nirvanaJhevaDeck) currentDeckName = 'nirvana';
                    else if (currentDeck === majestyDeck) currentDeckName = 'majesty';
                    else if (currentDeck === youthberkDeck) currentDeckName = 'youthberk';
                    else if (currentDeck === avantgardaDeck) currentDeckName = 'avantgarda';
                    else if (currentDeck === overlordDeck) currentDeckName = 'overlord';
                    else if (currentDeck === seraphDeck) currentDeckName = 'seraph';

                    // Start game immediately to avoid losing messages during the 1s delay
                    setupConnection();
                    // Sync deck info
                    sendData({ type: 'hostAck', deck: currentDeckName });
                }
            };

            conn.on('data', waitForJoin);

            conn.on('close', () => {
                if (gameStarted) {
                    alert('Lost connection to rival.');
                    window.location.href = 'lobby.html';
                }
            });

            if (gameStatusText) gameStatusText.textContent = 'Rival attempting to join...';
        });

        peer.on('error', (err) => {
            console.error('PeerJS error:', err.type);
            if (gameStatusText) gameStatusText.textContent = `Error: ${err.type}`;
            const dot = document.querySelector('.status-dot');
            if (dot) dot.classList.remove('online');
        });
    }

    function setupConnection() {
        console.log("Activating Game UI and listeners...");
        gameStarted = true;

        if (matchmakingOverlay) {
            matchmakingOverlay.classList.add('fade-out');
            setTimeout(() => matchmakingOverlay.classList.add('hidden'), 800);
        }
        gameContainer.classList.remove('hidden');
        gameContainer.classList.add('page-enter'); // Add smooth page enter animation

        if (isHost) {
            networkInfo.textContent = 'Online (Host)';
        } else {
            networkInfo.textContent = 'Online (Guest)';
        }
        initGame();

        // Primary game data listener
        conn.on('data', handleIncomingData);
    }

    function startAIGame(pDeckKey, aDeckKey, diff) {
        console.log("Starting AI Game:", pDeckKey, "vs", aDeckKey);
        isAIMode = true;
        aiDifficulty = diff;
        aiDeckType = aDeckKey;
        gameStarted = true;
        isHost = true;
        isFirstPlayer = true;
        window.isFirstPlayer = true;
        isMyTurn = true;

        // Set player deck
        if (pDeckKey === 'bruce') currentDeck = bruceDeck;
        else if (pDeckKey === 'magnolia') currentDeck = magnoliaDeck;
        else if (pDeckKey === 'youthberk') currentDeck = youthberkDeck;
        else if (pDeckKey === 'avantgarda') currentDeck = avantgardaDeck;
        else if (pDeckKey === 'majesty') currentDeck = majestyDeck;
        else if (pDeckKey === 'nirvana') currentDeck = nirvanaDeck;
        else if (pDeckKey === 'overlord') currentDeck = overlordDeck;
        else if (pDeckKey === 'greedon') currentDeck = greedonDeck;
        else if (pDeckKey === 'seraph') currentDeck = seraphDeck;

        // Initialize AI state
        let aiFullDeck;
        if (aDeckKey === 'bruce') aiFullDeck = bruceDeck;
        else if (aDeckKey === 'magnolia') aiFullDeck = magnoliaDeck;
        else if (aDeckKey === 'youthberk') aiFullDeck = youthberkDeck;
        else if (aDeckKey === 'avantgarda') aiFullDeck = avantgardaDeck;
        else if (aDeckKey === 'nirvana') aiFullDeck = nirvanaDeck;
        else if (aDeckKey === 'majesty') aiFullDeck = majestyDeck;
        else if (aDeckKey === 'overlord') aiFullDeck = overlordDeck;
        else if (aDeckKey === 'greedon') aiFullDeck = greedonDeck;
        else if (aDeckKey === 'seraph') aiFullDeck = seraphDeck;

        aiRideDeck = [...aiFullDeck.rideDeck];
        aiDeck = [...aiFullDeck.mainDeck].sort(() => 0.5 - Math.random());
        aiHand = aiDeck.splice(0, 5);
        aiSoul = [];
        aiDamage = [];
        aiDrop = [];

        // Hide overlay and show game
        if (matchmakingOverlay) {
            matchmakingOverlay.classList.add('fade-out');
            setTimeout(() => matchmakingOverlay.classList.add('hidden'), 800);
        }
        gameContainer.classList.remove('hidden');
        networkInfo.textContent = `Solo vs AI (${diff.toUpperCase()})`;

        initGame();
        initPrisonZones();

        // Place AI Starter
        const aiStarter = aiRideDeck.find(c => parseInt(c.grade) === 0);
        if (aiStarter) {
            const aiVC = document.querySelector('.opponent-side .circle.vc');
            const starterNode = createOpponentCardElement(aiStarter);
            aiVC.appendChild(starterNode);
            aiRideDeck.splice(aiRideDeck.indexOf(aiStarter), 1);
        }

        updateStatusUI();
        syncAIStateToUI();
    }

    async function sendData(data) {
        if (isAIMode) {
            await handleAILocalData(data);
            return;
        }
        if (conn && conn.open) conn.send(data);
    }

    async function handleAILocalData(data) {
        console.log("AI Local Data Received:", data.type);
        switch (data.type) {
            case 'rpsChoice':
                await aiWait(1000);
                const choices = ['rock', 'paper', 'scissors'];
                oppRpsChoice = choices[Math.floor(Math.random() * choices.length)];
                checkRpsResult();
                break;
            case 'declareAttack':
                await aiWait(1000);
                // Reset stale flags so handleGuardDecision isn't blocked
                currentAttackResolving = false;
                await handleAIGuardDecision(data);
                break;
            case 'resolveAttack':
                // Handle attack resolution when player attacks AI
                if (data.attackData && data.attackData.isHit) {
                    if (data.attackData.isTargetVanguard) {
                        const crit = parseInt(data.attackData.totalCritical || "1");
                        isProcessingDamage = true;
                        await aiDamageCheck(crit);
                        isProcessingDamage = false;
                    } else {
                        // AI Rearguard hit -> Retire
                        const targetId = data.attackData.targetId;
                        const targetNode = document.querySelector(`.opponent-side .circle[data-zone="${targetId}"] .card`) || document.getElementById('opp-' + targetId) || document.getElementById(targetId);
                        if (targetNode) {
                            alert(`AI เรียร์การ์ดถูกรีไทร์: ${targetNode.dataset.name}`);
                            const dropZone = document.querySelector('.opponent-side .drop-zone');
                            if (dropZone) {
                                dropZone.appendChild(targetNode);
                                targetNode.classList.remove('rest', 'attacking-glow');
                                targetNode.style.position = ""; // Reset any positioning
                                targetNode.style.top = "";
                                targetNode.style.left = "";
                                targetNode.style.transform = "";
                            }
                            updateDropCount();
                        }
                    }
                }
                isWaitingForGuard = false;
                currentAttackResolving = false;
                checkAllAttackersRested();
                break;
            case 'revealDrive':
                // Show player's drive check card visually (already handled by player's own driveCheck)
                break;
            case 'phaseChange':
                // AI can react to player phase changes if needed
                break;
            case 'nextTurn':
                // AI already knows it's its turn
                break;
            case 'mulliganReady':
                await handleAIMulligan();
                break;
            case 'forceImprison':
                // AI reacts to player's imprison effects (Penetrate Aquas, Cuff Spring, Makarite)
                if (data.fromZone === 'hand') {
                    if (aiHand.length > 0) {
                        const target = aiHand.splice(0, 1)[0];
                        const zoneNode = document.querySelector('.my-side .order-zone');
                        if (zoneNode) {
                            const cardNode = createOpponentCardElement(target);
                            zoneNode.appendChild(cardNode);
                            cardNode.classList.add('imprisoned-card');
                            sendData({ type: 'announce', msg: `AI: ขัง ${target.name} จากมือ!` });
                            if (data.drawAfterMove) {
                                aiHand.push(aiDeck.shift());
                                alert("AI ได้จั่ว 1 ใบจากการถูกขังมือ!");
                            }
                        }
                    }
                } else if (data.fromZone === 'drop') {
                    if (aiDrop.length > 0) {
                        const target = aiDrop.splice(0, 1)[0];
                        const zoneNode = document.querySelector('.my-side .order-zone');
                        if (zoneNode) {
                            const cardNode = createOpponentCardElement(target);
                            zoneNode.appendChild(cardNode);
                            cardNode.classList.add('imprisoned-card');
                            sendData({ type: 'announce', msg: `AI: ขัง ${target.name} จากดรอป!` });
                        }
                    }
                } else if (data.fromZone === 'deck') {
                    if (aiDeck.length > 0) {
                        const target = aiDeck.shift();
                        const zoneNode = document.querySelector('.my-side .order-zone');
                        if (zoneNode) {
                            const cardNode = createOpponentCardElement(target);
                            zoneNode.appendChild(cardNode);
                            cardNode.classList.add('imprisoned-card');
                            sendData({ type: 'announce', msg: `AI: ขังใบจากกองการ์ด!` });
                        }
                    }
                }
                syncAIStateToUI();
                updateAllStaticBonuses();
                updateAllPrisonUI();
                break;
            case 'forceImprisonSpecific':
                // AI specific card imprisonment (e.g. choice-based)
                const targetId = data.targetId;
                const aiTarget = document.querySelector(`.opponent-side .card[id="${targetId}"], .opponent-side .card[id="opp-${targetId}"]`);
                if (aiTarget) {
                    const playerOrderZone = document.querySelector('.my-side .order-zone');
                    playerOrderZone.appendChild(aiTarget);
                    aiTarget.classList.add('imprisoned-card');
                    sendData({ type: 'announce', msg: `AI: ${aiTarget.dataset.name} ถูกขังในคุก!` });
                }
                updateAllStaticBonuses();
                updateAllPrisonUI();
                break;
            case 'forceRetire':
                const retireId = data.cardId;
                const aiRetire = document.getElementById(`opp-${retireId}`) || document.getElementById(retireId);
                if (aiRetire && aiRetire.closest('.opponent-side')) {
                    const aiDropZone = document.querySelector('.opponent-side .drop-zone');
                    aiDropZone.appendChild(aiRetire);
                    aiRetire.classList.remove('rest');
                    alert(`AI: รีไทร์ ${aiRetire.dataset.name}`);
                }
                updateDropCount();
                break;
            case 'checkUpdateSeraph':
                updateAllStaticBonuses();
                updateAllPrisonUI();
                break;
            case 'prisonSync':
                // Real-time prison count sync from opponent
                updateAllPrisonUI();
                break;
        }
    }

    async function handleAIMulligan() {
        alert("AI is performing Mulligan...");
        await aiWait(1500);

        // Simple Heuristic: Keep one of each grade (1, 2, 3) if possible.
        // Return triggers (high shield) and duplicates.
        const kept = [];
        const returned = [];
        const seenGrades = new Set();

        aiHand.forEach(card => {
            const g = parseInt(card.grade);
            if (card.trigger) {
                returned.push(card);
            } else if (g > 0 && g <= 3 && !seenGrades.has(g)) {
                kept.push(card);
                seenGrades.add(g);
            } else {
                returned.push(card);
            }
        });

        // Ensure we keep at least some cards if we returned too many
        if (kept.length < 2 && returned.length > 0) {
            kept.push(returned.pop());
        }

        // Return to deck and shuffle
        returned.forEach(c => aiDeck.push(c));
        aiDeck.sort(() => 0.5 - Math.random());

        // Draw back to 5
        const newHand = [...kept];
        while (newHand.length < 5 && aiDeck.length > 0) {
            newHand.push(aiDeck.shift());
        }

        aiHand = newHand;
        oppConfirmedMulligan = true;
        alert("AI is ready!");
        checkGameStart();
        syncAIStateToUI();
    }

    // Store the current attack data for AI guard resolution
    let aiCurrentGuardAttackData = null;

    async function handleAIGuardDecision(attackData) {
        // Store the full attackData from the player's declareAttack
        aiCurrentGuardAttackData = attackData;

        const attackPower = parseInt(attackData.totalPower || attackData.power || "0");
        const attackCritical = parseInt(attackData.totalCritical || "1");
        console.log("AI Guarding against:", attackPower, "Critical:", attackCritical);

        const vg = document.querySelector('.opponent-side .circle.vc .card');
        const vgPower = vg ? parseInt(vg.dataset.power) : 10000;

        let totalShieldNeeded = attackPower - vgPower;
        if (totalShieldNeeded < 0) totalShieldNeeded = 0;
        totalShieldNeeded += 5000;

        // === Decision Logic ===
        let shouldGuard = false;
        if (aiDamage.length >= 5) {
            shouldGuard = true;
        } else if (aiDamage.length >= 4) {
            shouldGuard = true;
        } else if (aiDamage.length >= 3 && attackCritical >= 2) {
            shouldGuard = true;
        } else if (aiDifficulty === 'hard') {
            shouldGuard = attackCritical >= 2 || Math.random() > 0.4;
        } else {
            shouldGuard = Math.random() > 0.6;
        }

        if (!shouldGuard) {
            alert("AI เลือก NO GUARD! (รับดาเมจ)");
            await aiWait(800);
            finishAIGuarding([], false);
            return;
        }

        // === PG Logic ===
        if (aiDamage.length >= 5) {
            const pgIdx = aiHand.findIndex(c => c.isPG || (c.skill && c.skill.includes('Perfect Guard')));
            if (pgIdx !== -1) {
                const pg = aiHand.splice(pgIdx, 1)[0];
                alert(`AI ใช้ Perfect Guard: ${pg.name}!`);
                await aiWait(800);
                if (aiHand.length >= 1) {
                    const discardIdx = aiHand.findIndex(c => !!c.trigger) !== -1 ?
                        aiHand.findIndex(c => !!c.trigger) : aiHand.length - 1;
                    aiDrop.push(aiHand.splice(discardIdx, 1)[0]);
                }
                finishAIGuarding([pg], true);
                return;
            }
        }

        // === Normal Guard ===
        const guards = [];
        let totalShieldFound = 0;

        const shieldCards = aiHand.filter(c => parseInt(c.shield || "0") > 0 && !c.isPG);
        shieldCards.sort((a, b) => parseInt(a.shield || "0") - parseInt(b.shield || "0"));

        for (const card of shieldCards) {
            if (totalShieldFound >= totalShieldNeeded) break;
            const shield = parseInt(card.shield || "0");
            totalShieldFound += shield;
            guards.push(card);
        }

        guards.forEach(g => {
            const idx = aiHand.indexOf(g);
            if (idx !== -1) aiHand.splice(idx, 1);
        });

        if (guards.length > 0 && totalShieldFound >= totalShieldNeeded) {
            alert(`AI GUARD: ${guards.length} ใบ! (โล่รวม: ${totalShieldFound})`);
            await aiWait(800);
            finishAIGuarding(guards, false);
        } else {
            guards.forEach(g => aiHand.push(g));
            alert("AI ไม่สามารถป้องกันได้เพียงพอ! รับดาเมจ");
            await aiWait(800);
            finishAIGuarding([], false);
        }
    }

    function finishAIGuarding(guards, isPG = false) {
        // Move guards to drop
        guards.forEach(g => aiDrop.push(g));
        const totalShield = guards.reduce((acc, g) => acc + parseInt(g.shield || "0"), 0);

        // Use the stored attackData from handleAIGuardDecision
        const storedAttackData = aiCurrentGuardAttackData || {};

        if (guards.length === 0 && !isPG) {
            // No guard
            handleGuardDecision({
                type: 'guardDecision',
                decision: 'no-guard',
                attackData: storedAttackData
            });
        } else {
            // Normal guard with shield OR Perfect Guard
            handleGuardDecision({
                type: 'guardDecision',
                decision: 'guard',
                attackData: storedAttackData
            });

            setTimeout(() => {
                handleFinishGuard({
                    type: 'finishGuard',
                    attackData: storedAttackData,
                    totalShield: totalShield,
                    isPG: isPG
                });
                syncAIStateToUI();
            }, 800);
        }

        syncAIStateToUI();
    }

    async function aiDriveCheck(count, crit) {
        if (count <= 0) {
            const attacker = document.querySelector('.opponent-side .circle.vc .card');
            const targetId = window.aiCurrentAttackTarget || 'vc';
            await evaluateAIHitResult(attacker, targetId, crit);
            return;
        }

        if (aiDeck.length === 0) {
            alert("AI Deck Out! Player Wins!");
            showGameOver('Win');
            return;
        }

        const cardData = aiDeck.shift();
        const triggerName = {
            'Heal': 'ฮีล',
            'Critical': 'คริติคอล',
            'Draw': 'ดรอว์',
            'Front': 'ฟรอนต์',
            'Over': 'โอเวอร์'
        };
        const displayTrigger = cardData.trigger ? ` [${triggerName[cardData.trigger] || cardData.trigger} ทริกเกอร์!]` : '';

        // === Visual Drive Check Display ===
        const checkCard = createOpponentCardElement(cardData);
        checkCard.style.position = 'fixed';
        checkCard.style.top = '30%';
        checkCard.style.left = '50%';
        checkCard.style.transform = 'translate(-50%, -50%) scale(1.8)';
        checkCard.style.zIndex = '10001';
        checkCard.style.pointerEvents = 'none';
        checkCard.style.transition = 'all 0.5s ease';
        checkCard.style.boxShadow = cardData.trigger ? '0 0 40px 15px rgba(255,42,109,0.8)' : '0 0 20px 5px rgba(0,200,255,0.5)';
        if (cardData.trigger) checkCard.classList.add('effect-trigger');
        document.body.appendChild(checkCard);

        alert(`AI ไดรฟ์เช็ค: ${cardData.name}${displayTrigger}`);

        if (cardData.trigger) {
            resolveAITrigger(cardData);
        }

        aiHand.push(cardData);
        syncAIStateToUI();

        // Remove visual after delay
        await aiWait(2000);
        if (checkCard.parentElement) checkCard.remove();

        if (count > 1) {
            await aiDriveCheck(count - 1, crit);
        } else {
            const attacker = document.querySelector('.opponent-side .circle.vc .card');
            const targetId = window.aiCurrentAttackTarget || 'vc';
            await evaluateAIHitResult(attacker, targetId, crit);
        }
    }

    async function aiDamageCheck(count) {
        if (count <= 0) return;
        if (aiDeck.length === 0) {
            alert("AI Deck Out! Player Wins!");
            showGameOver('Win');
            return;
        }

        const cardData = aiDeck.shift();
        const triggerName = {
            'Heal': 'ฮีล',
            'Critical': 'คริติคอล',
            'Draw': 'ดรอว์',
            'Front': 'ฟรอนต์',
            'Over': 'โอเวอร์'
        };
        const displayTrigger = cardData.trigger ? ` [${triggerName[cardData.trigger] || cardData.trigger} ทริกเกอร์!]` : '';

        // --- Visual Damage Check ---
        const damageZoneNode = document.querySelector('.opponent-side .damage-zone');
        const cardNode = createOpponentCardElement(cardData);
        cardNode.style.position = 'fixed';
        cardNode.style.top = '40%';
        cardNode.style.left = '50%';
        cardNode.style.transform = 'translate(-50%, -50%) scale(1.4)';
        cardNode.style.zIndex = '1000000';
        cardNode.style.boxShadow = '0 0 40px rgba(255, 42, 109, 0.8)';
        cardNode.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        document.body.appendChild(cardNode);

        alert(`AI ดาเมจเช็ค: ${cardData.name}${displayTrigger}`);
        await aiWait(1200);

        if (cardData.trigger) {
            resolveAITrigger(cardData, true);
        }

        // Move to Damage Zone visually
        if (damageZoneNode) {
            const rect = damageZoneNode.getBoundingClientRect();
            cardNode.style.top = `${rect.top + rect.height / 2}px`;
            cardNode.style.left = `${rect.left + rect.width / 2}px`;
            cardNode.style.transform = 'translate(-50%, -50%) scale(0.3) rotate(90deg)';
            cardNode.style.opacity = '0.5';
            await aiWait(500);
        }
        cardNode.remove();

        aiDamage.push(cardData);

        // Add card to AI damage zone DOM
        if (damageZoneNode) {
            const finalCard = createOpponentCardElement(cardData);
            finalCard.classList.add('rest'); // Damage is face-up but rested/sideways usually
            damageZoneNode.appendChild(finalCard);
        }

        syncAIStateToUI();

        const oppVG = document.querySelector('.opponent-side .circle.vc .card');
        const oppVGName = oppVG ? oppVG.dataset.name : "";
        const hasBaseGreedonInAISoul = aiSoul.some(c => c.name && c.name === 'Avaricious Demonic Dragon, Greedon');
        const aiMaxDamage = (oppVGName.includes('Greedon Masques') || (oppVGName === 'Avaricious Demonic Dragon, Greedon' && hasBaseGreedonInAISoul)) ? 7 : 6;

        if (aiDamage.length >= aiMaxDamage) {
            alert(`AI has ${aiMaxDamage} damage! YOU WIN!`);
            showGameOver('Win');
            return;
        }

        await aiWait(800);
        if (count > 1) {
            await aiDamageCheck(count - 1);
        }
    }

    function resolveAITrigger(cardData, isDamageCheck = false) {
        const type = cardData.trigger;
        alert(`AI ${type} Trigger Resolving...`);

        // Smart Power Distribution
        const units = Array.from(document.querySelectorAll('.opponent-side .circle .card:not(.rest)'));
        const playerVG = document.querySelector('.my-side .circle.vc .card');
        const pVGPower = playerVG ? parseInt(playerVG.dataset.power) : 10000;

        let target = units.find(u => u.parentElement.classList.contains('vc')) || units[0];
        
        // Strategy: Give power to a STANDING unit that currently CANT hit the VG
        const standingUnits = units.filter(u => !u.classList.contains('rest') && !u.parentElement.classList.contains('vc'));
        const needingBuff = standingUnits.find(u => parseInt(u.dataset.power) < pVGPower);
        
        if (needingBuff) {
            target = needingBuff;
        } else if (standingUnits.length > 0) {
            target = standingUnits[0]; // Give to next attacker
        }

        if (target) {
            target.dataset.power = (parseInt(target.dataset.power) + 10000).toString();
            syncPowerDisplay(target);
            alert(`AI มอบพลัง +10,000 ให้ ${target.dataset.name}! (เพื่อปิดเกม)`);
        }

        if (type === 'Critical' && !isDamageCheck) {
            const vg = document.querySelector('.opponent-side .circle.vc .card');
            if (vg) {
                vg.dataset.critical = (parseInt(vg.dataset.critical || "1") + 1).toString();
                alert("AI Vanguard gets +1 Critical!");
            }
        } else if (type === 'Heal') {
            if (aiDamage.length >= damageCountNum.textContent) {
                const healed = aiDamage.pop();
                if (healed) aiDrop.push(healed);
                alert("AI Heals 1 damage!");
            }
        } else if (type === 'Draw') {
            if (aiDeck.length > 0) {
                aiHand.push(aiDeck.shift());
                alert("AI Draws 1 card!");
            }
        } else if (type === 'Front') {
            document.querySelectorAll('.opponent-side .front-row .circle .card').forEach(u => {
                u.dataset.power = (parseInt(u.dataset.power) + 10000).toString();
                syncPowerDisplay(u);
            });
            alert("AI front row units get +10,000 Power!");
        }

        syncAIStateToUI();
    }

    async function processAIDeckLogic(context) {
        if (aiDeckType === 'bruce') {
            if (context === 'main') {
                // Bruce logic: Soul Charge
                if (aiSoul.length < 5 && aiDeck.length > 5) {
                    alert("AI Bruce: Soul Charging...");
                    aiSoul.push(aiDeck.shift());
                    aiSoul.push(aiDeck.shift());
                    syncAIStateToUI();
                }
                if (currentTurn >= 4) {
                    isOpponentFinalRush = true;
                    isOpponentFinalBurst = (currentTurn >= 6);
                    updateStatusUI();
                }
            }
        } else if (aiDeckType === 'youthberk') {
            if (context === 'battle_start') {
                // Youthberk logic
            }
        }
    }

    async function handleAIRevolDress() {
        if (aiDeckType !== 'youthberk') return false;
        const revolForm = aiHand.find(c => c.name.includes('RevolForm'));
        if (revolForm && aiHand.length >= 2) {
            alert("AI YOUTHBERK: REVOLDRESS!");
            // Discard 1
            aiDrop.push(aiHand.splice(aiHand.indexOf(aiHand.find(c => c !== revolForm)), 1)[0]);

            // Ride RevolForm
            const vc = document.querySelector('.opponent-side .circle.vc');
            const skyfall = vc.querySelector('.card');
            if (skyfall) {
                aiSoul.push(skyfall);
                skyfall.remove();
            }
            const newNode = createOpponentCardElement(revolForm);
            newNode.dataset.isRevolDressRide = "true";
            vc.appendChild(newNode);
            aiHand.splice(aiHand.indexOf(revolForm), 1);

            syncAIStateToUI();
            await aiWait(1000);
            return true;
        }
        return false;
    }
    function processPlayerDamage(count) {
        alert(`คุณได้รับความเสียหาย ${count} ดาเมจ! เริ่มทำการดาเมจเช็คทีละใบ`);
        dealDamage(count); // Use the actual damage check function
    }

    function openSkillViewer(card) {
        if (!skillViewer) return;

        const originalId = card.dataset.originalId;
        const effectiveCard = originalId ? document.getElementById(originalId) : card;

        skillCardName.textContent = effectiveCard.dataset.name;
        skillCardGrade.textContent = `Grade: ${effectiveCard.dataset.grade}`;
        skillCardPower.textContent = `Power: ${effectiveCard.dataset.power}`;
        skillCardShield.textContent = `Shield: ${effectiveCard.dataset.shield}`;
        skillText.textContent = effectiveCard.dataset.skill;

        // Apply background image to modal
        const modal = skillViewer.querySelector('.skill-modal');
        if (modal) {
            const url = effectiveCard.dataset.imageUrl;
            if (url) modal.style.setProperty('--card-art-url', `url('${url}')`);
            else modal.style.removeProperty('--card-art-url');
        }

        // Show Activate button if it's an [ACT] skill on my field
        const activateBtn = document.getElementById('activate-skill-btn');
        if (activateBtn) {
            const isMyCard = !effectiveCard.classList.contains('opponent-card');
            const isOnField = effectiveCard.parentElement && effectiveCard.parentElement.classList.contains('circle');
            const inHand = effectiveCard.parentElement && effectiveCard.parentElement.dataset.zone === 'hand';
            const inDrop = effectiveCard.parentElement && effectiveCard.parentElement.classList.contains('drop-zone');
            const hasAct = effectiveCard.dataset.skill && effectiveCard.dataset.skill.includes('[ACT]');
            const hasHandAct = effectiveCard.dataset.skill && effectiveCard.dataset.skill.includes('[ACT](Hand)');
            const hasDropAct = effectiveCard.dataset.skill && effectiveCard.dataset.skill.includes('[ACT](Drop)');
            const isMainPhase = phases[currentPhaseIndex] === 'main';

            if (isMyCard && (isOnField || (inHand && hasHandAct) || (inDrop && hasDropAct)) && hasAct && isMyTurn && isMainPhase) {
                activateBtn.classList.remove('hidden');
                activateBtn.onclick = async () => {
                    await activateCardSkill(effectiveCard);
                    skillViewer.classList.add('hidden');
                };
            } else {
                activateBtn.classList.add('hidden');
            }
        }

        const playOrderBtn = document.getElementById('play-order-btn');
        if (playOrderBtn) {
            const skillLC = (effectiveCard.dataset.skill || "").toLowerCase();
            const isOrder = skillLC.includes('order]');
            const inHand = effectiveCard.parentElement && effectiveCard.parentElement.dataset.zone === 'hand';

            if (isOrder && inHand && isMyTurn) {
                playOrderBtn.classList.remove('hidden');
                playOrderBtn.onclick = async () => {
                    await playOrder(effectiveCard);
                    skillViewer.classList.add('hidden');
                };
            } else {
                playOrderBtn.classList.add('hidden');
            }
        }


        const xoverBtn = document.getElementById('x-overdress-btn');
        if (xoverBtn) {
            const skillLC = (card.dataset.skill || "").toLowerCase();
            const inHand = card.parentElement && card.parentElement.dataset.zone === 'hand';
            const isMainPhase = phases[currentPhaseIndex] === 'main';
            const isVairina = (card.dataset.name || "").includes("Vairina");
            const isXOD = isVairina && (skillLC.includes('x-overdress') || skillLC.includes('xoverdress'));
            const isOD = isVairina && skillLC.includes('overdress') && !isXOD;

            if (inHand && isMyTurn && isMainPhase && (isXOD || isOD)) {
                xoverBtn.classList.remove('hidden');
                xoverBtn.textContent = isXOD ? "Perform X-overDress" : "Perform overDress";
                xoverBtn.onclick = async () => {
                    skillViewer.classList.add('hidden');
                    if (isXOD) await performXoverDress(card);
                    else await performOverDress(card);
                };
            } else {
                xoverBtn.classList.add('hidden');
            }
        }

        skillViewer.classList.remove('hidden');
    }

    async function performOverDress(odCard) {
        const materialName = "Trickstar";
        alert(`overDress: เลือก ${materialName} จากสนาม`);
        document.body.classList.add('targeting-mode');
        const mat = await new Promise(resolve => {
            const listener = (e) => {
                const target = e.target.closest('.circle.rc .card:not(.opponent-card)');
                if (target && target.dataset.name.includes(materialName)) {
                    e.stopPropagation();
                    document.body.classList.remove('targeting-mode');
                    document.removeEventListener('click', listener, true);
                    resolve(target);
                }
            };
            document.addEventListener('click', listener, true);
        });

        alert("เลือกช่อง RC เพื่อคอลยูนิท overDress");
        document.body.classList.add('targeting-mode');
        const circle = await new Promise(resolve => {
            const listener = (ev) => {
                const targetCircle = ev.target.closest('.circle.rc');
                if (targetCircle) {
                    ev.stopPropagation();
                    document.body.classList.remove('targeting-mode');
                    document.removeEventListener('click', listener, true);
                    resolve(targetCircle);
                }
            };
            document.addEventListener('click', listener, true);
        });

        odCard.originalDress = [{
            name: mat.dataset.name,
            grade: mat.dataset.grade,
            power: mat.dataset.power,
            shield: mat.dataset.shield,
            skill: mat.dataset.skill
        }];

        odCard.unitSoul = [mat];
        mat.remove();

        circle.innerHTML = '';
        circle.appendChild(odCard);
        odCard.classList.remove('rest');
        odCard.dataset.isOverDress = "true";

        let badge = odCard.querySelector('.dress-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'dress-badge';
            badge.style.position = 'absolute';
            badge.style.bottom = '-8px';
            badge.style.left = '50%';
            badge.style.transform = 'translateX(-50%)';
            badge.style.backgroundColor = '#9333ea';
            badge.style.color = '#fff';
            badge.style.padding = '2px 6px';
            badge.style.borderRadius = '8px';
            badge.style.fontSize = '0.65rem';
            badge.style.fontWeight = 'bold';
            badge.style.zIndex = '5';
            badge.style.pointerEvents = 'none';
            odCard.appendChild(badge);
        }
        badge.textContent = 'OD';
        applyStaticBonuses(odCard);
        sendMoveData(odCard);
        updateSoulUI();
        updateHandCount();

        await checkOnPlaceAbilities(odCard);
        alert(`${odCard.dataset.name} overDress สำเร็จ!`);
    }

    async function performXoverDress(vairinaCard) {
        const skillLC = (vairinaCard.dataset.skill || "").toLowerCase();
        let material1Name = "Trickstar";
        let material2Name = "Equip Dragon"; // Default

        if (skillLC.includes('graillumirror')) material2Name = "Graillumirror";
        else if (skillLC.includes('galondight')) material2Name = "Galondight";
        else material2Name = "Equip Dragon"; // Fallback for Baur/Stragallio etc.

        alert(`X-overDress: เลือก ${material1Name} และ ${material2Name} จากสนาม`);

        // Step 1: Select Material 1
        alert(`Step 1: เลือก ${material1Name} จากสนาม`);
        document.body.classList.add('targeting-mode');
        const mat1 = await new Promise(resolve => {
            const listener = (e) => {
                const target = e.target.closest('.circle.rc .card:not(.opponent-card)');
                if (target && target.dataset.name.includes(material1Name)) {
                    e.stopPropagation();
                    document.body.classList.remove('targeting-mode');
                    document.removeEventListener('click', listener, true);
                    resolve(target);
                }
            };
            document.addEventListener('click', listener, true);
        });

        // Step 2: Select Material 2
        alert(`Step 2: เลือก ${material2Name} (Equip Dragon) จากสนาม`);
        document.body.classList.add('targeting-mode');
        const mat2 = await new Promise(resolve => {
            const listener = (e) => {
                const target = e.target.closest('.circle.rc .card:not(.opponent-card)');
                if (target && (target.dataset.name.includes(material2Name) || target.dataset.name.includes("Equip Dragon"))) {
                    if (target === mat1) {
                        alert("เลือกซ้ำไม่ได้!");
                        return;
                    }
                    e.stopPropagation();
                    document.body.classList.remove('targeting-mode');
                    document.removeEventListener('click', listener, true);
                    resolve(target);
                }
            };
            document.addEventListener('click', listener, true);
        });

        // Step 3: Choose where to Call Vairina
        alert("Step 3: เลือกช่อง RC เพื่อคอลยูนิท X-overDress");
        document.body.classList.add('targeting-mode');
        const circle = await new Promise(resolve => {
            const listener = (ev) => {
                const targetCircle = ev.target.closest('.circle.rc');
                if (targetCircle) {
                    ev.stopPropagation();
                    document.body.classList.remove('targeting-mode');
                    document.removeEventListener('click', listener, true);
                    resolve(targetCircle);
                }
            };
            document.addEventListener('click', listener, true);
        });

        // Resolve X-overDress
        const mats = [mat1, mat2];
        vairinaCard.originalDress = mats.map(m => {
            return {
                name: m.dataset.name,
                grade: m.dataset.grade,
                power: m.dataset.power,
                shield: m.dataset.shield,
                skill: m.dataset.skill,
                isPG: m.dataset.isPG === "true"
            };
        });

        vairinaCard.unitSoul = mats;
        mats.forEach(m => {
            m.remove();
        });

        circle.innerHTML = '';
        circle.appendChild(vairinaCard);
        vairinaCard.classList.remove('rest');
        vairinaCard.dataset.isXoverDress = "true";

        let badge = vairinaCard.querySelector('.dress-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'dress-badge';
            badge.style.position = 'absolute';
            badge.style.bottom = '-8px';
            badge.style.left = '50%';
            badge.style.transform = 'translateX(-50%)';
            badge.style.backgroundColor = '#e11d48';
            badge.style.color = '#fff';
            badge.style.padding = '2px 6px';
            badge.style.borderRadius = '8px';
            badge.style.fontSize = '0.65rem';
            badge.style.fontWeight = 'bold';
            badge.style.zIndex = '5';
            badge.style.pointerEvents = 'none';
            vairinaCard.appendChild(badge);
        }
        badge.textContent = 'X-OD';

        applyStaticBonuses(vairinaCard);
        sendMoveData(vairinaCard);
        updateSoulUI();
        updateHandCount();

        alert(`${vairinaCard.dataset.name} X-overDress สำเร็จ!`);

        // --- OriginalDress Triggers (When becoming material) ---
        for (const mData of vairinaCard.originalDress) {
            if (mData.name.includes('Stragallio')) {
                if (await vgConfirm("Stragallio: [AUTO] เมื่อกลายเป็นการ์ดซ้อน (originalDress) [CB1] เพื่อคอล Trickstar จากดรอบ?")) {
                    if (payCounterBlast(1)) {
                        promptCallFromDrop(1, (c) => c.dataset.name.includes("Trickstar"));
                    }
                }
            }
            if (mData.name.includes('Galondight')) {
                // [AUTO]: When this card becomes an originalDress, power +5000,
                // and if the outerDress is "Garou Vairina", it gets another [Power] +5000.
                let bonus = 5000;
                if (vairinaCard.dataset.name.includes('Garou Vairina')) bonus = 10000;
                vairinaCard.dataset.turnEndBuffPower = (parseInt(vairinaCard.dataset.turnEndBuffPower || "0") + bonus).toString();
                vairinaCard.dataset.turnEndBuffActive = "true";
                applyStaticBonuses(vairinaCard);
                alert(`Galondight (Material): มอบพลังให้ ${vairinaCard.dataset.name} +${bonus} (จนจบเทิร์น)!`);
            }
        }

        // --- On-Place & Dresser Skills ---
        // Vils Vairina On-Place
        if (vairinaCard.dataset.name.includes('Vils Vairina')) {
            if (await vgConfirm("Vils Vairina: [AUTO] เมื่อลงด้วย X-overDress เลือกการ์ด X-overDress 1 ใบจากดรอบขึ้นมือ?")) {
                promptAddFromDropToHand((c) => c.dataset.skill && c.dataset.skill.includes("X-overDress") && !c.dataset.name.includes("Vils Vairina"));
            }
        }

        // Mirrors Vairina On-Place
        if (vairinaCard.dataset.name.includes('Mirrors Vairina')) {
            if (await vgConfirm("Mirrors Vairina: [AUTO] เมื่อลงด้วย X-overDress เลือก 'Vairina' 2 ใบจากดรอบมาซ้อนใต้?")) {
                promptDressMultipleFromDrop(vairinaCard, 2, (c) => c.dataset.name.includes("Vairina"));
            }
        }


        await checkOnPlaceAbilities(vairinaCard);
        // Material skills already triggered above
    }

    function promptDressMultipleFromDrop(vairinaCard, maxCount, filterFn, count = 0) {
        if (count >= maxCount) return;
        const dropZone = document.querySelector('.my-side .drop-zone');
        const cards = Array.from(dropZone.querySelectorAll('.card')).filter(filterFn);
        if (cards.length === 0) return;

        openViewer(`เลือกการ์ดใบที่ ${count + 1}/${maxCount} เพื่อซ้อนใต้ ${vairinaCard.dataset.name}`, cards);
        const sel = (e) => {
            const clicked = e.target.closest('.card');
            if (clicked && clicked.parentElement === viewerGrid) {
                const originalId = clicked.dataset.originalId;
                const originalCard = document.getElementById(originalId);
                if (originalCard) {
                    viewerGrid.removeEventListener('click', sel);
                    zoneViewer.classList.add('hidden');

                    // Track originalDress
                    if (!vairinaCard.originalDress) vairinaCard.originalDress = [];
                    vairinaCard.originalDress.push({
                        name: originalCard.dataset.name,
                        grade: originalCard.dataset.grade,
                        power: originalCard.dataset.power,
                        shield: originalCard.dataset.shield,
                        skill: originalCard.dataset.skill
                    });

                    if (!vairinaCard.unitSoul) vairinaCard.unitSoul = [];
                    vairinaCard.unitSoul.push(originalCard);
                    originalCard.remove();
                    updateSoulUI();
                    updateDropCount();
                    promptDressMultipleFromDrop(vairinaCard, maxCount, filterFn, count + 1);
                }
            }
        };
        viewerGrid.addEventListener('click', sel);
    }

    function promptAddFromDropToHand(filterFn, onSuccess) {
        const dropZone = document.querySelector('.my-side .drop-zone');
        const cards = Array.from(dropZone.querySelectorAll('.card')).filter(filterFn);
        if (cards.length === 0) return;

        openViewer("เลือกการ์ดจาก Drop Box ขึ้นมือ", cards);
        const sel = (e) => {
            const clicked = e.target.closest('.card');
            if (clicked && clicked.parentElement === viewerGrid) {
                const originalId = clicked.dataset.originalId;
                const originalCard = document.getElementById(originalId);
                if (originalCard) {
                    viewerGrid.removeEventListener('click', sel);
                    zoneViewer.classList.add('hidden');
                    playerHand.appendChild(originalCard);
                    updateHandSpacing();
                    sendMoveData(originalCard);
                    updateDropCount();
                    alert(`นำ ${originalCard.dataset.name} ขึ้นมือสำเร็จ!`);
                    if (onSuccess) onSuccess();
                }
            }
        };
        viewerGrid.addEventListener('click', sel);
    }

    async function playOrder(card) {
        const originalId = card.dataset.originalId;
        const effectiveCard = originalId ? document.getElementById(originalId) : card;

        const skillText = (effectiveCard.dataset.skill || "").toLowerCase();
        const isSetOrder = skillText.includes('set order');
        const isBlitzOrder = skillText.includes('blitz order');

        const orderGrade = parseInt(effectiveCard.dataset.grade || 0);
        const vgCard = document.querySelector('.my-side .circle.vc .card');
        const vgGrade = vgCard ? parseInt(vgCard.dataset.grade || 0) : 0;

        if (orderGrade > vgGrade) {
            alert(`ไม่สามารถใช้งาน Order เกรด ${orderGrade} ได้ เนื่องจากแวนการ์ดของคุณคือเกรด ${vgGrade}!`);
            return;
        }

        if (isBlitzOrder) {
            if (window.currentIncomingAttack && window.currentIncomingAttack.bomberNoBlitz) {
                alert("Guard Restrict! คุณไม่สามารถใช้งาน Blitz Order ได้ในขณะนี้!");
                return;
            }
        } else {
            // Normal Order or Set Order can only be played in Main Phase
            if (phases[currentPhaseIndex] !== 'main') {
                alert("Order สามารถเล่นได้เฉพาะใน Main Phase เท่านั้น!");
                return;
            }
        }

        let isFree = false;
        if (isSetOrder && nextSetOrderFree) {
            isFree = true;
            nextSetOrderFree = false; // Consume free status
        }

        if (ordersPlayedCount >= maxOrdersPerTurn && !isFree) {
            alert(`คุณสามารถเล่นทักษะ Order ได้สูงสุด ${maxOrdersPerTurn} ครั้งในเทิร์นนี้!`);
            return;
        }

        const confirmPlay = await vgConfirm(`Play Order: ${effectiveCard.dataset.name}?`);
        if (!confirmPlay) return;

        // Note: For now activateCardSkill triggers costs. If isFree, we should ideally bypass CB/SB.
        // For simplicity with Habitable Zone, we'll assume the prompt says "without paying its cost".
        // In full implementation, activateCardSkill needs to take an 'isFree' parameter.
        if (isFree) effectiveCard.dataset.playOrderFree = "true";

        const skillResult = await activateCardSkill(effectiveCard);

        if (isFree) effectiveCard.dataset.playOrderFree = "false";

        if (skillResult === false) return;

        if (isSetOrder) {
            const orderZone = document.querySelector('.my-side .order-zone');
            if (orderZone) {
                // Remove existing strategy if you want only one set order active?
                // In Vanguard, you can have multiple. But often for strategies you might swap.
                // Re-playing same strategy replaces? Let's keep multiple for now as per rules.
                orderZone.appendChild(effectiveCard);
                sendMoveData(effectiveCard);
                updateHandCount();
                orderPlayedThisTurn = true;
                strategyActivatedThisTurn = true;
                if (effectiveCard.dataset.name.includes("Strategy")) {
                    strategyPutToOrderZoneThisTurn = true;
                }
                ordersPlayedCount++;
                sendData({ type: 'strategyActivated', active: true }); // Sync strategy activation
                alert(`Played Set Order: ${effectiveCard.dataset.name}`);
                return;
            }
        }

        // Move to drop zone
        const dropZone = document.querySelector('.my-side .drop-zone');
        if (dropZone) {
            dropZone.appendChild(effectiveCard);
            sendMoveData(effectiveCard);
            updateHandCount();
            updateDropCount();
            orderPlayedThisTurn = true;
            strategyActivatedThisTurn = true;
            ordersPlayedCount++;
            sendData({ type: 'strategyActivated', active: true }); // Sync strategy activation
            alert(`Played Order: ${effectiveCard.dataset.name}`);
        }
    }


    async function activateCardSkill(card) {
        const originalId = card.dataset.originalId;
        const effectiveCard = originalId ? document.getElementById(originalId) : card;

        if (effectiveCard.dataset.actUsed === "true") {
            alert("ความสามารถ [ACT] นี้ถูกใช้งานไปแล้วในเทิร์นนี้! (1/Turn)");
            return;
        }

        const sideClass = effectiveCard.closest('.opponent-side') ? '.opponent-side' : '.my-side';
        const isMySide = sideClass === '.my-side';
        const oppSideClass = isMySide ? '.opponent-side' : '.my-side';
        
        const name = effectiveCard.dataset.name;
        const parent = effectiveCard.parentElement;
        const zone = parent ? (parent.dataset.zone || "") : "";
        const isRC = zone.startsWith('rc');
        const isVC = zone === 'vc';

        const isJhevaOrGrail = name.includes('Nirvana Jheva'); // Removed Graillumirror duplicate

        // Broadcast skill activation to opponent
        const skillText = effectiveCard.dataset.skill || "";
        if (!skillText.toLowerCase().includes('order]')) {
             sendData({ type: 'announce', msg: `คู่แข่งใช้งานความสามารถของ: ${name}` });
        }

        // --- Seraph Snow [ACT](VC/RC) ---
        if (name.includes('Seraph Snow') && (isVC || isRC)) {
            if (await vgConfirm("Seraph Snow: [CB1] เลือกเรียร์การ์ดคู่แข่งสูงสุด 2 ใบ ขังเข้าในคุก?")) {
                if (payCounterBlast(1)) {
                    effectiveCard.dataset.actUsed = "true";
                    
                    if (isAIMode && !isMySide) {
                        // AI Automated Selection
                        const humanRCs = Array.from(document.querySelectorAll('.my-side .circle.rc .card:not(.opponent-card)'));
                        for (let i = 0; i < Math.min(2, humanRCs.length); i++) {
                            const target = humanRCs[i];
                            const targetId = target.dataset.originalId || target.id;
                            sendData({ type: 'forceImprisonSpecific', targetId: targetId });
                            const aiOrderZone = document.querySelector('.opponent-side .order-zone');
                            aiOrderZone.appendChild(target);
                            target.classList.add('imprisoned-card');
                        }
                        updateCountsUI();
                        updateAllStaticBonuses();
                        return true;
                    }

                    // Count ONLY opponent rear-guards (on their side relative to player)
                    const opponentRCs = Array.from(document.querySelectorAll(`${oppSideClass} .circle.rc .card`));
                    const maxTargets = Math.min(2, opponentRCs.length);

                    if (maxTargets === 0) {
                        alert("คู่แข่งไม่มีเรียร์การ์ดเหลือบนสนามให้ขัง!");
                        return true;
                    }

                    alert(`คลิกเลือกเรียร์การ์ดคู่แข่งไม่เกิน ${maxTargets} ใบเพื่อนำไปขังในคุก`);
                    let imprisoned = 0;
                    document.body.classList.add('targeting-mode');
                    await new Promise(resolve => {
                        const targetListener = (e) => {
                            const target = e.target.closest(`${oppSideClass} .circle.rc .card`);
                            if (target) {
                                e.stopPropagation();
                                const targetId = target.dataset.originalId || target.id;
                                sendData({ type: 'forceImprisonSpecific', targetId: targetId });
                                const myOrderZone = document.querySelector('.my-side .order-zone');
                                if (myOrderZone) {
                                    myOrderZone.appendChild(target);
                                    target.classList.add('imprisoned-card');
                                }
                                updateCountsUI();
                                updateAllStaticBonuses();
                                imprisoned++;
                                if (imprisoned >= maxTargets) {
                                    document.body.classList.remove('targeting-mode');
                                    document.removeEventListener('click', targetListener, true);
                                    resolve();
                                } else {
                                    alert(`ขังใบที่ ${imprisoned} สำเร็จ! เลือกใบถัดไป (หรือคลิกที่อื่นเพื่อจบ)`);
                                }
                            } else if (e.target.closest('.action-btn') || e.target.closest('.menu-container')) {
                                document.body.classList.remove('targeting-mode');
                                document.removeEventListener('click', targetListener, true);
                                resolve();
                            }
                        };
                        document.addEventListener('click', targetListener, true);
                    });
                    return true;
                }
            }
        }

        // --- Galaxy Central Prison, Galactolus (Set Order) ---
        if (name.toLowerCase().includes('galaxy central prison')) {
            const isInOrderZone = card.parentElement && card.parentElement.classList.contains('order-zone');
            
            if (!isInOrderZone) {
                // WHEN PLAYED FROM HAND [AUTO]
                if (await vgConfirm("ต้องการเล่น Galaxy Central Prison? คอสต์: [Rest] ยูนิท 1 ใบ?")) {
                    if (isAIMode && !isMySide) {
                        const aiUnits = Array.from(document.querySelectorAll(`${sideClass} .circle .card`)).filter(u => !u.classList.contains('rest'));
                        if (aiUnits.length > 0) {
                            aiUnits[0].classList.add('rest');
                            sendMoveData(aiUnits[0]);
                        }
                        alert("AI Prison: Soul Charge 3!");
                        for (let i = 0; i < 3; i++) {
                            if (aiDeck.length > 0) aiSoul.push(aiDeck.shift());
                        }
                        syncAIStateToUI();
                        return true;
                    }

                    const myUnits = Array.from(document.querySelectorAll(`${sideClass} .circle .card:not(.opponent-card)`)).filter(u => !u.classList.contains('rest'));
                    if (myUnits.length === 0) {
                        alert("คุณไม่มี Unit ให้ [Rest] เพื่อจ่ายคอสต์!");
                        return false;
                    }
                    
                    alert("กรุณาเลือกยูนิท 1 ใบเพื่อ [Rest] (คอสต์เล่นออเดอร์)");
                    document.body.classList.add('targeting-mode');
                    const rested = await new Promise(resolve => {
                        const restListener = (e) => {
                            const target = e.target.closest(`${sideClass} .circle .card`);
                            if (target && !target.classList.contains('rest')) {
                                e.stopPropagation();
                                target.classList.add('rest');
                                sendMoveData(target);
                                document.body.classList.remove('targeting-mode');
                                document.removeEventListener('click', restListener, true);
                                resolve(true);
                            }
                        };
                        document.addEventListener('click', restListener, true);
                    });

                    if (!rested) return false;
                    alert("Galaxy Central Prison: Soul Charge 3!");
                    soulCharge(3);
                    return true;
                }
            } else {
                // INTERACTION WHEN ALREADY ON FIELD [CONT/ACT]
                alert("Prison กำลังทำงาน: ยูนิทแถวหน้าของคุณจะเก่งขึ้นตามจำนวนผู้ถูกกักกัน (CONT)");
                // การเรียกประกันตัวนั้นจัดการโดยการคลิกที่การ์ดที่ถูกขังโดยตรงครับ
                return true;
            }
            return false;
        }

        // --- Security Upgrader [ACT] ---
        if (name.toLowerCase().includes('security upgrader')) {
            const vg = document.querySelector('.my-side .circle.vc .card');
            const vgGrade = parseInt(vg?.dataset.grade || 0);
            const vgName = (vg?.dataset.name || "").toLowerCase();
            if (vgGrade >= 3 && vgName.includes('seraph') && !hasRiddenThisTurn) {
                if (await vgConfirm("Security Upgrader: [Retire ตัวเอง] เพื่อไรด์ Seraph G4 จาก (มือ/กอง/ดรอป) และลด CB1 ในเทิร์นนี้?")) {
                    const g4Seraphs = [
                        ...deckPool.filter(c => c.name.toLowerCase().includes('purelight')),
                        ...Array.from(playerHand.querySelectorAll('.card')).map(c => JSON.parse(c.dataset.cardData)).filter(c => c.name.toLowerCase().includes('purelight')),
                        ...Array.from(document.querySelectorAll('.my-side .drop-zone .card')).map(c => JSON.parse(c.dataset.cardData)).filter(c => c.name.toLowerCase().includes('purelight'))
                    ];

                    if (g4Seraphs.length > 0) {
                        // Retire self
                        card.classList.add('effect-retired');
                        setTimeout(() => {
                            document.querySelector('.my-side .drop-zone').appendChild(card);
                            updateDropCount();
                        }, 500);

                        // Pick one to ride
                        openViewer("เลือก Seraph เกรด 4 1 ใบเพื่อไรด์", g4Seraphs);
                        await new Promise(resolveRide => {
                            const ridePicker = (e) => {
                                const selected = e.target.closest('.card');
                                if (selected && selected.parentElement === viewerGrid) {
                                    const cData = JSON.parse(selected.dataset.cardData);
                                    // Remove from wherever it was
                                    const fromHand = playerHand.querySelector(`.card[data-name="${cData.name}"]`);
                                    if (fromHand) fromHand.remove();
                                    const inDeckIdx = deckPool.findIndex(c => c.name === cData.name);
                                    if (inDeckIdx !== -1) deckPool.splice(inDeckIdx, 1);
                                    const inDrop = document.querySelector(`.my-side .drop-zone .card[data-name="${cData.name}"]`);
                                    if (inDrop) inDrop.remove();

                                    // RIDE
                                    const vcCircle = document.querySelector('.my-side .circle.vc');
                                    // 1. Move old VG to Soul
                                    const oldVG = vcCircle.querySelector('.card:not(.opponent-card)');
                                    if (oldVG) {
                                        soulPool.push(oldVG);
                                        sendMoveData(oldVG, 'soul');
                                    }
                                    vcCircle.innerHTML = '';
                                    
                                    // 2. Place new VG
                                    const newVG = createCardElement(cData);
                                    vcCircle.appendChild(newVG);
                                    hasRiddenThisTurn = true;
                                    window.seraphCostReduction = true;
                                    window.rodeFromG3ThisTurn = true; // since old VG was G3
                                    
                                    // Opponent imprisons 1 from drop
                                    sendData({ type: 'forceImprison', min: 1, max: 1, fromZone: 'drop' });
                                    
                                    alert(`ไรด์ ${cData.name} สำเร็จ! คอสต์ของ Purelight ลดลง CB1 ในเทิร์นนี้!`);
                                    viewerGrid.removeEventListener('click', ridePicker);
                                    zoneViewer.classList.add('hidden');
                                    
                                    // 3. Trigger Ride abilities for Purelight
                                    updateSoulUI();
                                    handleRideAbilities(newVG);
                                    checkOnPlaceAbilities(newVG);
                                    sendMoveData(newVG);
                                    
                                    resolveRide();
                                }
                            };
                            viewerGrid.addEventListener('click', ridePicker);
                        });
                        return true;
                    } else {
                        alert("ไม่พบ Seraph เกรด 4 ใน มือ/กอง/ดรอป!");
                    }
                }
            } else {
                alert("เงื่อนไขไม่ครบ: ต้องมีแวน Seraph G3+ และยังไม่ได้ไรด์ในเทิร์นนี้");
            }
            return false;
        }

        // --- Aurora Battle Princess, Grenade Marieda [AUTO] ---
        if (name.toLowerCase().includes('grenade marieda')) {
            const oppPrison = document.querySelectorAll('.opponent-side .order-zone .card.imprisoned-card');
            if (oppPrison.length > 0 && await vgConfirm("Marieda: เลือกการ์ดในคุกคู่แข่งลงใต้กอง, คู่แข่งขัง G0 ในดรอป 1 ใบ, ใบนี้ +5000?")) {
                alert("คลิกเลือกการ์ดในคุกคู่แข่ง 1 ใบเพื่อนำลงใต้กอง");
                document.body.classList.add('targeting-mode');
                const moved = await new Promise(resolveSwap => {
                    const swapListener = (e) => {
                        const target = e.target.closest('.opponent-side .order-zone .card.imprisoned-card');
                        if (target) {
                            e.stopPropagation();
                            target.remove(); // Put to bottom (just remove here for simplicity)
                            sendData({ type: 'announce', msg: 'ขังในคุกถูกสลับลงใต้กองกองการ์ดแล้ว!' });
                            document.body.classList.remove('targeting-mode');
                            document.removeEventListener('click', swapListener, true);
                            resolveSwap(true);
                        }
                    };
                    document.addEventListener('click', swapListener, true);
                });

                if (moved) {
                    sendData({ type: 'forceImprison', min: 1, max: 1, fromZone: 'drop' }); // Simplified G0 check via prompt
                    card.dataset.power = parseInt(card.dataset.power) + 5000;
                    updateAllStaticBonuses();
                    return true;
                }
            }
            return false;
        }

        // --- Aurora Battle Princess, Lifle Royar [ACT] ---
        if (name.toLowerCase().includes('lifle royar')) {
            if (await vgConfirm("Lifle Royar: [CB1] ขัง RC คู่แข่ง 1 ใบ และเรียกการ์ดใหม่จากบนสุดกอง 5 ใบ?")) {
                if (payCounterBlast(1)) {
                    // Imprison 1
                    alert("เลือกเรียร์การ์ดคู่แข่ง 1 ใบเข้าคุก");
                    document.body.classList.add('targeting-mode');
                    await new Promise(resImp => {
                        const impL = (e) => {
                            const t = e.target.closest('.opponent-side .circle.rc .card');
                            if (t) {
                                e.stopPropagation();
                                imprisonCard(t);
                                document.body.classList.remove('targeting-mode');
                                document.removeEventListener('click', impL, true);
                                resImp();
                            }
                        };
                        document.addEventListener('click', impL, true);
                    });

                    // Top 5 Call
                    const top5 = deckPool.slice(0, 5);
                    const vgGrade = parseInt(document.querySelector('.my-side .circle.vc .card').dataset.grade);
                    const validUnits = top5.filter(c => c.grade <= vgGrade);

                    if (validUnits.length > 0) {
                        openViewer("เลือกการ์ดเรียกเกรดไม่เกินแวนการ์ดลง (RC)", validUnits);
                        await new Promise(resCall => {
                            const callP = (e) => {
                                const clicked = e.target.closest('.card');
                                if (clicked && clicked.parentElement === viewerGrid) {
                                    const cData = JSON.parse(clicked.dataset.cardData);
                                    const idx = deckPool.findIndex(c => c.name === cData.name);
                                    if (idx !== -1) {
                                        const callUnit = createCardElement(deckPool.splice(idx, 1)[0]);
                                        alert("เลือกช่อง (RC) เพื่อวางยูนิท");
                                        document.body.classList.add('targeting-mode');
                                        const placeL = (pe) => {
                                            const circle = pe.target.closest('.my-side .circle.rc');
                                            if (circle) {
                                                circle.appendChild(callUnit);
                                                sendMoveData(callUnit);
                                                document.body.classList.remove('targeting-mode');
                                                document.removeEventListener('click', placeL, true);
                                                resCall();
                                            }
                                        };
                                        document.addEventListener('click', placeL, true);
                                    }
                                    viewerGrid.removeEventListener('click', callP);
                                    zoneViewer.classList.add('hidden');
                                }
                            };
                            viewerGrid.addEventListener('click', callP);
                        });
                    } else {
                        alert("ไม่พบยูนิทที่เกรดไม่เกินแวนการ์ดใน 5 ใบแรก!");
                    }
                    deckPool.sort(() => 0.5 - Math.random());
                    updateDeckCounter();
                    return true;
                }
            }
            return false;
        }

        // --- Gratias Gradale (Regalis Piece) ---
        if (name.includes('Gratias Gradale')) {
            const vgCard = document.querySelector(`${sideClass} .circle.vc .card`);
            if (vgCard && parseInt(vgCard.dataset.grade || "0") === 3 && vgCard.dataset.persona === "true") {
                if (isMySide && hasRiddenThisTurn) {
                    alert("ไม่สามารถใช้งานได้ เพราะคุณทำการไรด์ไปแล้วในเทิร์นนี้!");
                    return false;
                }
                if (window.regalisPieceUsed) {
                    alert("คุณใช้งาน Regalis Piece ไปแล้วในเกมนี้!");
                    return false;
                }
                if (await vgConfirm("Gratias Gradale: ทำงาน Persona Ride (จั่ว 1, แถวหน้า +10000)?")) {
                    window.regalisPieceUsed = true;
                    drawCard(1);
                    triggerPersonaRide();
                    alert("Persona Ride ทำงาน!");
                    return true;
                }
            } else {
                alert("แวนการ์ดของคุณไม่ใช่เกรด 3 หรือไม่มีสัญลักษณ์ Persona Ride!");
            }
            return false;
        }

        // --- Dragon Knight, Nehalem (Overlord) [ACT](RC) ---
        if (name.toLowerCase().includes('nehalem')) {
            const vgCard = document.querySelector(`${sideClass} .circle.vc .card`);
            if (vgCard && vgCard.dataset.name.includes('Overlord')) {
                if (await vgConfirm("Nehalem: [ACT](RC) [SB1] แวนการ์ดและยูนิตนี้ พลัง +5000 จนจบเทิร์น?")) {
                    if (await paySoulBlast(1)) {
                        card.dataset.power = (parseInt(card.dataset.power) + 5000).toString();
                        card.dataset.turnEndBuffPower = (parseInt(card.dataset.turnEndBuffPower || "0") + 5000).toString();
                        card.dataset.turnEndBuffActive = "true";
                        syncPowerDisplay(card);
                        sendMoveData(card);

                        vgCard.dataset.power = (parseInt(vgCard.dataset.power) + 5000).toString();
                        vgCard.dataset.turnEndBuffPower = (parseInt(vgCard.dataset.turnEndBuffPower || "0") + 5000).toString();
                        vgCard.dataset.turnEndBuffActive = "true";
                        syncPowerDisplay(vgCard);
                        sendMoveData(vgCard);

                        alert("Nehalem และ Vanguard พลัง +5000!");
                        card.dataset.actUsed = "true";
                        return;
                    }
                }
            } else {
                alert("แวนการ์ดของคุณไม่ติดชื่อ 'Overlord'!");
            }
            return false;
        }

        // --- Ardor Hatchet Dragon [ACT](RC) ---
        if (name.includes('Ardor Hatchet Dragon')) {
            const oppVG = document.querySelector(`${oppSideClass} .circle.vc .card`);
            if (oppVG && parseInt(oppVG.dataset.grade || "0") >= 3) {
                const dropG3Overlords = Array.from(document.querySelectorAll(`${sideClass} .drop-zone .card`)).filter(c =>
                    parseInt(c.dataset.grade) === 3 && c.dataset.name.includes('Overlord')
                );
                if (dropG3Overlords.length > 0) {
                    if (await vgConfirm("Ardor Hatchet: [ACT](RC) [Retire ยูนิตนี้] เลือกการ์ดเกรด 3 ที่ติดชื่อ 'Overlord' จากดรอป 1 ใบเข้าโซล?")) {
                        const dropZone = document.querySelector(`${sideClass} .drop-zone`);
                        dropZone.appendChild(effectiveCard);
                        effectiveCard.classList.remove('rest');
                        sendMoveData(effectiveCard);
                        effectiveCard.dataset.actUsed = "true";

                        openViewer("เลือกการ์ด G3 'Overlord' เข้าโซล", dropG3Overlords.map(c => ({
                            name: c.dataset.name,
                            id: c.id,
                            imageUrl: c.querySelector('img')?.src || ''
                        })));
                        await new Promise(resolve => {
                            const pickHandler = (e) => {
                                const clicked = e.target.closest('.card');
                                if (clicked && clicked.parentElement === viewerGrid) {
                                    const selectedId = clicked.dataset.originalId || clicked.id;
                                    const actual = dropG3Overlords.find(c => c.id === selectedId);
                                    if (actual) {
                                        soulPool.push(actual);
                                        actual.remove();
                                        updateSoulUI();
                                        updateDropCount();
                                        sendMoveData(actual, 'soul');
                                        alert(`นำ ${actual.dataset.name} เข้าโซลสำเร็จ!`);
                                    }
                                    viewerGrid.removeEventListener('click', pickHandler);
                                    zoneViewer.classList.add('hidden');
                                    resolve();
                                }
                            };
                            viewerGrid.addEventListener('click', pickHandler);
                        });
                        return;
                    }
                } else {
                    alert("ไม่มีการ์ดเกรด 3 ที่ติดชื่อ 'Overlord' ในดรอปโซน!");
                }
            } else {
                alert("แวนการ์ดของคู่แข่งไม่ใช่เกรด 3 หรือสูงกว่า!");
            }
            return false;
        }

        // --- Departure Towards the Dawn [Order] ---
        if (name.includes('Departure Towards the Dawn')) {
            if (await vgConfirm("Departure Towards the Dawn: [CB1] ดู 5 ใบ เลือก 'Blaster' 1 ใบขึ้นมือ?")) {
                if (payCounterBlast(1)) {
                    const top5 = deckPool.slice(0, 5);
                    openViewer("Departure Towards the Dawn: Top 5", top5);
                    const sel = (e) => {
                        const clicked = e.target.closest('.card');
                        if (clicked && clicked.parentElement === viewerGrid) {
                            const cName = clicked.dataset.name;
                            if (cName.includes('Blaster')) {
                                viewerGrid.removeEventListener('click', sel);
                                zoneViewer.classList.add('hidden');

                                const id = clicked.dataset.originalId;
                                const originalIdx = deckPool.findIndex(c => c.id === id);
                                const chosenData = deckPool.splice(originalIdx, 1)[0];

                                const chosenElem = createCardElement(chosenData);
                                playerHand.appendChild(chosenElem);
                                updateHandSpacing();
                                sendMoveData(chosenElem);
                                alert(`นำ ${cName} ขึ้นมือ!`);

                                deckPool.sort(() => 0.5 - Math.random());
                                updateDeckCounter();
                            }
                        }
                    };
                    viewerGrid.addEventListener('click', sel);

                    const closeHManual = () => {
                        deckPool.sort(() => 0.5 - Math.random());
                        updateDeckCounter();
                        closeViewerBtn.removeEventListener('click', closeHManual);
                        viewerGrid.removeEventListener('click', sel);
                    };
                    closeViewerBtn.addEventListener('click', closeHManual);
                    return true;
                } else return false;
            } else return false;
        }

        // --- Avaricious Demonic Dragon King, Greedon Masques [ACT](VC) ---
        if (name.includes('Greedon Masques')) {
            if (await vgConfirm("Greedon Masques: [ACT] [นำ Greedon ชื่ออื่นออกจากเกม] ดู 7 ใบ เลือก Desire Devil 1 ใบขึ้นมือ?")) {
                const greedonCandidates = [];
                // Check Hand
                Array.from(playerHand.querySelectorAll('.card')).forEach(c => {
                    if (c.dataset.name.includes('Greedon') && !c.dataset.name.includes('Masques')) greedonCandidates.push({ node: c, zone: 'hand' });
                });
                // Check Soul
                soulPool.forEach((c, idx) => {
                    if (c.dataset.name.includes('Greedon') && !c.dataset.name.includes('Masques')) greedonCandidates.push({ node: c, zone: 'soul', index: idx });
                });
                // Check Drop
                Array.from(document.querySelectorAll('.my-side .drop-zone .card')).forEach(c => {
                    if (c.dataset.name.includes('Greedon') && !c.dataset.name.includes('Masques')) greedonCandidates.push({ node: c, zone: 'drop' });
                });

                if (greedonCandidates.length === 0) {
                    alert("ไม่พบการ์ด 'Greedon' ชื่ออื่นในมือ, โซล หรือดรอปโซน เพื่อจ่ายคอสต์!");
                    return false;
                }

                openViewer("เลือก Greedon 1 ใบเพื่อนำออกจากเกม", greedonCandidates.map(c => ({
                    name: c.node.dataset.name, id: c.node.id, imageUrl: c.node.dataset.imageUrl, zone: c.zone
                })));

                await new Promise(resolveCost => {
                    const costSel = (e) => {
                        const tgt = e.target.closest('.card');
                        if (tgt && tgt.parentElement === viewerGrid) {
                            const ref = greedonCandidates.find(c => c.node.id === (tgt.dataset.originalId || tgt.id));
                            if (ref) {
                                viewerGrid.removeEventListener('click', costSel);
                                zoneViewer.classList.add('hidden');

                                // Remove the card
                                if (ref.zone === 'soul') {
                                    const actualIdx = soulPool.indexOf(ref.node);
                                    if (actualIdx !== -1) soulPool.splice(actualIdx, 1);
                                }
                                ref.node.remove();
                                updateSoulUI();
                                updateDropCount();
                                sendMoveData(ref.node, 'remove');

                                // Effect: Top 7
                                const top7 = deckPool.slice(0, 7);
                                const targets = top7.filter(c => c.name.toLowerCase().includes('desire devil'));
                                if (targets.length > 0) {
                                    openViewer("Top 7: เลือก Desire Devil 1 ใบ", targets);
                                    const targetSel = (ev) => {
                                        const picked = ev.target.closest('.card');
                                        if (picked && picked.parentElement === viewerGrid) {
                                            const selectedId = picked.dataset.originalId;
                                            const tIdx = deckPool.findIndex(c => c.id === selectedId);
                                            if (tIdx !== -1) {
                                                const cardData = deckPool.splice(tIdx, 1)[0];
                                                const el = createCardElement(cardData);
                                                playerHand.appendChild(el);
                                                sendMoveData(el);
                                                updateHandSpacing();
                                                updateDeckCounter();
                                                alert(`นำ ${cardData.name} ขึ้นมือแล้ว!`);
                                            }
                                            viewerGrid.removeEventListener('click', targetSel);
                                            zoneViewer.classList.add('hidden');
                                            deckPool.sort(() => 0.5 - Math.random());
                                            updateDeckCounter();
                                            resolveCost();
                                        }
                                    };
                                    viewerGrid.addEventListener('click', targetSel);
                                } else {
                                    alert("ไม่พบ Desire Devil ใน 7 ใบแรก!");
                                    deckPool.sort(() => 0.5 - Math.random());
                                    updateDeckCounter();
                                    resolveCost();
                                }
                            }
                        }
                    };
                    viewerGrid.addEventListener('click', costSel);
                    closeViewerBtn.onclick = () => { zoneViewer.classList.add('hidden'); viewerGrid.removeEventListener('click', costSel); resolveCost(); };
                });
                card.dataset.actUsed = "true";
                return true;
            }
        }

        // --- Masque of Hydragrum [Order ACT] ---
        if (name.includes('Masque of Hydragrum')) {
            const inHand = effectiveCard.parentElement && effectiveCard.parentElement.dataset.zone === 'hand';
            const inDrop = effectiveCard.parentElement && effectiveCard.parentElement.classList.contains('drop-zone');

            if (inHand) {
                if (await vgConfirm("Masque of Hydragrum: [ACT] ดู 5 ใบ เลือก Dragontree หรือ Masques 1 ใบขึ้นมือ?")) {
                    const top5 = deckPool.slice(0, 5);
                    const targets = top5.filter(c => c.name.includes('Dragontree') || c.name.includes('Masques'));
                    if (targets.length > 0) {
                        openViewer("Top 5: เลือก Dragontree/Masques 1 ใบ", targets);
                        const selHydra = async (e) => {
                            const picked = e.target.closest('.card');
                            if (picked && picked.parentElement === viewerGrid) {
                                const idx = deckPool.findIndex(c => c.id === picked.dataset.originalId);
                                if (idx !== -1) {
                                    const data = deckPool.splice(idx, 1)[0];
                                    const el = createCardElement(data);
                                    playerHand.appendChild(el);
                                    sendMoveData(el);
                                    updateHandSpacing();
                                    updateDeckCounter();
                                    alert(`นำ ${data.name} ขึ้นมือแล้ว! (สับกองแล้ว)`);
                                    
                                    viewerGrid.removeEventListener('click', selHydra);
                                    zoneViewer.classList.add('hidden');
                                    deckPool.sort(() => 0.5 - Math.random());
                                    updateDeckCounter();

                                    // Move this Order to drop if successfully played
                                    const dropZone = document.querySelector('.my-side .drop-zone');
                                    dropZone.appendChild(effectiveCard);
                                    sendMoveData(effectiveCard);
                                    updateDropCount();
                                }
                            }
                        };
                        viewerGrid.addEventListener('click', selHydra);
                    } else {
                        alert("ไม่พบ Dragontree หรือ Masques ใน 5 ใบแรก! (สับกองแล้ว)");
                        deckPool.sort(() => 0.5 - Math.random());
                        updateDeckCounter();

                        // Still move the order to drop as it was played
                        const dropZone = document.querySelector('.my-side .drop-zone');
                        dropZone.appendChild(effectiveCard);
                        sendMoveData(effectiveCard);
                        updateDropCount();
                    }
                    return true;
                }
            } else if (inDrop) {

                // [ACT]Drop: Masque Ride
                const vg = document.querySelector('.my-side .circle.vc .card');
                const vgGrade = vg ? parseInt(vg.dataset.grade || "0") : 0;
                const vgName = vg ? vg.dataset.name : "";

                if (vgGrade === 3 && !vgName.includes('Masques')) {
                    const handMasques = Array.from(playerHand.querySelectorAll('.card')).filter(c =>
                        parseInt(c.dataset.grade) === 3 && c.dataset.name.includes('Masques')
                    );
                    if (handMasques.length > 0) {
                        if (await vgConfirm("Masque of Hydragrum: [ACT](Drop) [Reveal G3 Masques from Hand] เพื่อ Ride และทำ Persona Ride? (การ์ดนี้จะถูกนำออกจากเกม)")) {
                            openViewer("เลือกการ์ด Masques จากมือเพื่อ Ride", handMasques.map(c => ({
                                name: c.dataset.name, id: c.id, imageUrl: c.dataset.imageUrl
                            })));

                            await new Promise(resolveRide => {
                                const rideSel = (e) => {
                                    const tgt = e.target.closest('.card');
                                    if (tgt && tgt.parentElement === viewerGrid) {
                                        const actual = handMasques.find(c => c.id === (tgt.dataset.originalId || tgt.id));
                                        if (actual) {
                                            viewerGrid.removeEventListener('click', rideSel);
                                            zoneViewer.classList.add('hidden');

                                            // Trigger Ride
                                            const vc = document.querySelector('.my-side .circle.vc');
                                            const oldVG = vc.querySelector('.card');
                                            if (oldVG) {
                                                soulPool.push(oldVG);
                                                sendMoveData(oldVG, 'soul');
                                            }
                                            vc.innerHTML = '';
                                            vc.appendChild(actual);
                                            actual.classList.remove('rest');
                                            actual.style.transform = 'none';
                                            sendMoveData(actual);

                                            // Order Removed from Game (Exclude)
                                            effectiveCard.remove();
                                            sendMoveData(effectiveCard, 'remove');
                                            updateDropCount();

                                            // Persona Ride Check
                                            const oppVG = document.querySelector('.opponent-side .circle.vc .card');
                                            const oppGrade = oppVG ? parseInt(oppVG.dataset.grade || "0") : 0;
                                            if (oppGrade >= 3 && !hasRiddenThisTurn) {
                                                triggerPersonaRide();
                                            }

                                            hasRiddenThisTurn = true;
                                            handleRideAbilities(actual);
                                            updatePhaseUI(true);
                                            alert("Masque Ride สำเร็จ!");
                                            resolveRide();
                                        }
                                    }
                                };
                                viewerGrid.addEventListener('click', rideSel);
                                closeViewerBtn.onclick = () => { zoneViewer.classList.add('hidden'); viewerGrid.removeEventListener('click', rideSel); resolveRide(); };
                            });
                            return true;
                        }
                    } else {
                        alert("ไม่มีการ์ดเกรด 3 ที่ติดชื่อ 'Masques' ในมือ!");
                    }
                } else {
                    alert("แวนการ์ดต้องเป็นเกรด 3 และไม่มีชื่อ 'Masques' เพื่อใช้งานสิ่งนี้จากดรอป!");
                }
                return false;
            }
        }



        // --- Avantgarda Richter (Hand ACT) ---
        if (name.includes('Richter')) {
            const inHand = card.parentElement && card.parentElement.dataset.zone === 'hand';
            if (inHand) {
                const oppVG = document.querySelector('.opponent-side .circle.vc .card');
                const oppGrade = oppVG ? parseInt(oppVG.dataset.grade || "0") : 0;
                if (oppGrade >= 3) {
                    if (await vgConfirm("Richter: [ACT](Hand) [Reveal & Bind Avant from VC] เพื่อ Ride [Stand] และรับ ACT Skill?")) {
                        const vg = document.querySelector('.my-side .circle.vc .card');
                        if (vg && vg.dataset.name.includes('"Skyrender" Avantgarda')) {
                            // Cost: Bind VG
                            bindPool.push(vg);
                            vg.remove();
                            updateSoulUI(); // Sync indices

                            // Ride Richter
                            const vc = document.querySelector('.my-side .circle.vc');
                            vc.appendChild(card);
                            card.classList.remove('rest');
                            card.dataset.inheritedAvantAct = "true";
                            applyStaticBonuses(card);
                            sendMoveData(card);
                            sendData({ type: 'syncBindCount', count: bindPool.length });
                            updateAllStaticBonuses();
                            alert("Richter: Ride สำเร็จ! และได้รับ ACT ของใบที่ Bind");
                            return;
                        } else {
                            alert("ต้องมี \"Skyrender\" Avantgarda บนช่องแวนการ์ด!");
                        }
                    }
                } else {
                    alert("ความสามารถนี้ใช้ได้เมื่อคู่แข่งเกรด 3 ขึ้นไป!");
                }
                return;
            }
        }

        // --- Clean-sweep Dragon [ACT](RC) ---
        if (name.includes('Clean-sweep Dragon') && isRC) {
            if (!card.dataset.cleanSweepUsedThisTurn) {
                if (personaRideActive) {
                    if (await vgConfirm("Clean-sweep Dragon: [ACT][1/Turn] [CB1] เลือก RGs ตัวเองหรือคู่แข่งไม่เกิน 3 ใบ นำเข้าโซลเจ้าของ ยูนิทนี้ได้รับ พลัง+5000 ต่อ 1 ใบ?")) {
                        if (payCounterBlast(1)) {
                            card.dataset.cleanSweepUsedThisTurn = "true";
                            alert("คลิกที่ RGs บนสนาม (ตัวเองหรือคู่แข่ง) 1-3 ใบ จากนั้นคลิกที่พื้นที่ว่างเพื่อยืนยัน");
                            let chosenCards = [];
                            document.body.classList.add('targeting-mode');
                            
                            await new Promise(resSweep => {
                                const sweepListener = (e) => {
                                    const tgtCard = e.target.closest('.circle.rc .card');
                                    if (tgtCard) {
                                        e.stopPropagation();
                                        if (chosenCards.includes(tgtCard)) {
                                            chosenCards = chosenCards.filter(c => c !== tgtCard);
                                            tgtCard.style.boxShadow = "none";
                                        } else {
                                            if (chosenCards.length >= 3) {
                                                alert("เลือกได้สูงสุด 3 ใบเท่านั้น!");
                                                return;
                                            }
                                            chosenCards.push(tgtCard);
                                            tgtCard.style.boxShadow = "0 0 15px #f00";
                                        }
                                    } else {
                                        document.body.classList.remove('targeting-mode');
                                        document.removeEventListener('click', sweepListener, true);
                                        if (chosenCards.length > 0) {
                                            const confirmSweep = confirm(`ยืนยันการเลือก ${chosenCards.length} ใบเข้าสู่โซลของผู้เล่นนั้น?`);
                                            if (confirmSweep) {
                                                chosenCards.forEach(c => {
                                                    const oppSide = c.closest('.opponent-side');
                                                    if (oppSide) {
                                                        const p = c.parentElement;
                                                        const pCircleId = p ? p.id : '';
                                                        let actualCircleId = pCircleId.startsWith('opp-') ? pCircleId.substring(4) : pCircleId;
                                                        sendData({ type: 'retireOpponentRG', attackerName: "Clean-sweep Dragon", targetId: actualCircleId });
                                                        c.remove();
                                                    } else {
                                                        soulPool.push(c);
                                                        c.remove();
                                                        sendMoveData(c, 'soul');
                                                    }
                                                });
                                                updateSoulUI();
                                                const pwr = 5000 * chosenCards.length;
                                                card.dataset.power = (parseInt(card.dataset.power) + pwr).toString();
                                                card.dataset.turnEndBuffPower = (parseInt(card.dataset.turnEndBuffPower || "0") + pwr).toString();
                                                card.dataset.turnEndBuffActive = "true";
                                                syncPowerDisplay(card);
                                                alert(`Clean-sweep Dragon ได้รับพลัง +${pwr} จนจบเทิร์น!`);
                                            } else {
                                                chosenCards.forEach(c => c.style.boxShadow = "none");
                                                alert("ยกเลิกการเลือก");
                                            }
                                        }
                                        resSweep();
                                    }
                                };
                                document.addEventListener('click', sweepListener, true);
                            });
                        }
                    }
                } else {
                    alert("Clean-sweep Dragon: ต้องทำ Persona Ride ในเทิร์นนี้ก่อนจึงจะใช้ [ACT] ได้!");
                }
            } else {
                alert("ใช้ Clean-sweep Dragon ความสามารถในเทิร์นนี้ไปแล้ว!");
            }
        }

        // --- Avantgarda (ACT) ---
        const lowerName = name.toLowerCase();
        if (lowerName.includes('avantgarda') || (lowerName.includes('richter') && card.dataset.inheritedAvantAct === "true")) {
            if (await vgConfirm(`${name}: [ACT] [ใส่ Strategy ใน Order Zone เข้าโซล] เพื่อจั่ว 1, พลัง +5000 และได้รับ Restand Skill?`)) {
                const hasSora = soulPool.some(c => (c.dataset.name || "").includes('Sora Period'));
                if (!hasSora) {
                    alert("ต้องมี Blue Deathster, Sora Period ในโซลเพื่อใช้งานความสามารถนี้!");
                    return;
                }
                const strategiesOnFieldIdx = Array.from(document.querySelectorAll('.my-side .order-zone .card:not(.opponent-card)'));
                if (strategiesOnFieldIdx.length === 0) {
                    alert("ไม่มี Strategy ใน Order Zone เพื่อจ่ายคอสต์!");
                    return;
                }

                const strats = Array.from(document.querySelectorAll('.my-side .order-zone .card:not(.opponent-card)'))
                    .map(c => ({ src: 'order', id: c.id, name: c.dataset.name, dom: c }));
                const viewerData = strats.map(c => ({
                    name: c.name, id: c.id, grade: c.dom.dataset.grade, power: c.dom.dataset.power, shield: c.dom.dataset.shield, skill: c.dom.dataset.skill, imageUrl: c.dom.dataset.imageUrl
                }));

                let strat;
                if (isAIMode && !isMyTurn) {
                    strat = strats[0].dom;
                    console.log("AI Auto-picking Strategy:", strat.dataset.name);
                } else {
                    openViewer("เลือก Strategy 1 ใบเข้าโซล", viewerData);
                    strat = await new Promise(resolve => {
                        const sel = (e) => {
                            const tgt = e.target.closest('.card');
                            if (tgt && tgt.parentElement === viewerGrid) {
                                const cname = tgt.dataset.name;
                                const refCard = strats.find(c => c.name === cname);
                                if (refCard) {
                                    viewerGrid.removeEventListener('click', sel);
                                    zoneViewer.classList.add('hidden');
                                    resolve(refCard.dom);
                                }
                            }
                        };
                        viewerGrid.addEventListener('click', sel);
                    });
                }

                if (strat) {
                    const stratName = strat.dataset.name;
                    soulPool.push(strat);
                    sendMoveData(strat, 'soul'); // Tell opponent card moved to soul
                    strat.remove();
                    updateSoulUI();
                    sendData({ type: 'syncSoulCount', count: soulPool.length });
                    alert("จ่ายคอสต์สำเร็จ! จั่วการ์ด 1 ใบ");
                    drawCard(1);

                    card.dataset.avantSkillPowerBuffed = "true";
                    applyStaticBonuses(card);

                    // Both Avantgarda and Richter (with inherited ACT) get Restand ability
                    card.dataset.avantStandReady = "true";
                    alert(`${name}: Power +5000 และได้รับความสามารถ Restand เมื่อโจมตีฮิตหรือ Persona Ride!`);

                    // --- Death Winds Soul Bonus ---
                    if (stratName.includes('Death Winds')) {
                        const oppVG = document.querySelector('.opponent-side .circle.vc .card');
                        const oppGrade = oppVG ? parseInt(oppVG.dataset.grade || "0") : 0;
                        if (oppGrade >= 3) {
                            card.dataset.deathWindsAttackTrigger = "true";
                            alert("Death Winds Bonus: เมื่อยูนิตนี้โจมตี แถวหน้าทั้งหมดพลัง +5000!");
                        }
                    }

                    // --- Bomber Strategy: Dusting Soul Bonus ---
                    if (stratName.includes('Dusting')) {
                        bomberDustingPowerBuff = true;
                        bomberDustingNoIntercept = true;
                        bomberDustingNoBlitz = true;
                        updateAllStaticBonuses(); // Apply power immediately
                        alert("Bomber Strategy Dusting Bonus: แวนการ์ดพลัง +10000 และคู่แข่งไม่สามารถ Intercept หรือใช้งาน Blitz Order ได้จนจบเทิร์น!");
                    }

                    // --- Disruption Strategy: Killshroud Soul Bonus ---
                    if (stratName.includes('Killshroud')) {
                        // Power +5000 to Vanguard
                        card.dataset.killshroudPowerBuffed = "true";
                        updateAllStaticBonuses();

                        sendMoveData(card);
                        sendData({ type: 'killshroudDebuff' });

                        // Check if opponent has rear-guards to retire
                        const oppRGs = document.querySelectorAll('.opponent-side .circle.rc .card');
                        if (oppRGs.length > 0) {
                            if (isAIMode && !isMyTurn) {
                                // AI Auto-retire: Pick a front row RG if possible
                                const frontRGs = Array.from(document.querySelectorAll(`${oppSideClass} .circle[data-zone^="rc_front"] .card`));
                                const target = frontRGs[0] || oppRGs[0];
                                if (target) {
                                    alert(`AI Killshroud retires: ${target.dataset.name}`);
                                    const dropZone = document.querySelector(`${oppSideClass} .drop-zone`);
                                    if (dropZone) dropZone.appendChild(target);
                                    const rawId = target.id.replace('opp-', '');
                                    if (isAIMode) {
                                        // In AI mode, we don't necessarily need forceRetire if local
                                    } else {
                                        sendData({ type: 'forceRetire', cardId: rawId });
                                    }
                                    sendMoveData(target);
                                }
                            } else {
                                alert("Killshroud: เลือกเรียร์การ์ดคู่แข่ง 1 ใบเพื่อรีไทร์");
                                document.body.classList.add('targeting-mode');
                                const retireHandler = (e) => {
                                    const target = e.target.closest(`${oppSideClass} .circle.rc .card`);
                                    if (target) {
                                        e.stopPropagation();
                                        document.body.classList.remove('targeting-mode');
                                        document.removeEventListener('click', retireHandler, true);
                                        const dropZone = document.querySelector(`${oppSideClass} .drop-zone`);
                                        dropZone.appendChild(target);
                                        // Send forceRetire so opponent also sees the retirement
                                        const rawId = target.id.replace('opp-', '');
                                        sendData({ type: 'forceRetire', cardId: rawId });
                                        sendMoveData(target);
                                        alert("รีไทร์เรียร์การ์ดคู่แข่งสำเร็จ!");
                                    }
                                };
                                document.addEventListener('click', retireHandler, true);
                            }
                        } else {
                            alert("Killshroud: ไม่มีเรียร์การ์ดคู่แข่งให้รีไทร์! VG พลัง+5000 และ Guard Restrict สำเร็จ!");
                        }
                    }

                    lastStrategyPutIntoSoulName = stratName; // Save for Ala Dargente
                    updateAllStaticBonuses(); // Recalculate Milestone power immediately
                    syncPowerDisplay(card);
                    card.dataset.actUsed = "true";
                    sendMoveData(card);
                }
                return;
            }
        }

        if (isJhevaOrGrail && card.parentElement.classList.contains('vc')) {
            const skillName = 'Nirvana Jheva';
            if (await vgConfirm(`${skillName}: [ACT][ทิ้งการ์ด 1 ใบ] คอล Trickstar และ Prayer Dragon จาก Drop?`)) {
                if (await payDiscard(1)) {
                    alert("Step 1: เลือก Trickstar 1 ใบจาก Drop");
                    promptCallFromDrop(1, (c) => c.dataset.name.includes('Trickstar'), 0, () => {
                        alert("Step 2: เลือก Prayer Dragon (Equip Dragon) 1 ใบจาก Drop");
                        promptCallFromDrop(1, (c) => c.dataset.name.includes('Equip Dragon'), 0, () => {
                            card.dataset.actUsed = "true";
                            alert("Nirvana Jheva: คอลเรียบร้อย!");
                        });
                    });
                }
            }
        }

        if (name.includes('Bojalcorn')) {
            if (await vgConfirm("Bojalcorn: [ACT] จ่าย CB1 เพื่อรับความสามารถโจมตีแถวหน้าทั้งหมดจากแถวหลัง?")) {
                if (payCounterBlast(1)) {
                    card.dataset.bojalcornActive = "true";
                    card.dataset.actUsed = "true";
                    alert("Bojalcorn: ได้รับความสามารถโจมตีแถวหน้าทั้งหมดแล้ว! (ต้องโจมตีจากแถวหลัง)");
                    sendMoveData(card);
                }
            }
        }

        // --- Youthberk "Skyfall Arms" (ACT) ---
        if (name.includes('Skyfall Arms') && card.parentElement.classList.contains('vc')) {
            if (await vgConfirm('Youthberk "Skyfall Arms": [ACT](VC) [ทิ้ง 1 ใบ] ดู 3 ใบจากบนสุดของกอง เลือก "RevolForm" เข้ามือ หรือ คอลเกรด 2 หรือต่ำกว่าลง (RC)?')) {
                const handCards = Array.from(playerHand.querySelectorAll('.card'));
                if (handCards.length === 0) {
                    alert("ไม่มีการ์ดในมือเพื่อจ่ายคอสต์!");
                } else {
                    alert("เลือกการ์ด 1 ใบจากในมือเพื่อทิ้ง");
                    document.body.classList.add('targeting-mode');
                    await new Promise(resolveDiscard => {
                        const discardListener = (e) => {
                            const tgt = e.target.closest('.card');
                            if (tgt && tgt.parentElement && tgt.parentElement.dataset.zone === 'hand') {
                                e.stopPropagation();
                                document.body.classList.remove('targeting-mode');
                                document.removeEventListener('click', discardListener, true);

                                const dropZone = document.querySelector('.my-side .drop-zone');
                                dropZone.appendChild(tgt);
                                sendMoveData(tgt);
                                updateHandCount();
                                updateDropCount();
                                resolveDiscard();
                            }
                        };
                        document.addEventListener('click', discardListener, true);
                    });

                    if (deckPool.length < 3) { alert("การ์ดในกองไม่พอ!"); return; }
                    const top3 = deckPool.slice(0, 3);
                    deckPool.splice(0, 3);

                    openViewer("เลือก \"RevolForm\" ขึ้นมือ หรือ การ์ดเกรด <= 2 ลงช่อง RC (หากไม่เลือก ให้กดปิดเพื่อนำการ์ดทั้งหมดไว้ใต้กอง)", top3.map(c => ({ ...c, dataset: { name: c.name, grade: c.grade, skill: c.skill } })));

                    let isResolved = false;
                    const cleanupAndDone = () => {
                        if (!isResolved) {
                            isResolved = true;
                            while (top3.length > 0) {
                                deckPool.push(top3.shift());
                            }
                            updateDeckCounter();
                            card.dataset.actUsed = "true";
                        }
                    };

                    const selListener = (e) => {
                        const clicked = e.target.closest('.card');
                        if (clicked && clicked.parentElement === viewerGrid) {
                            const tName = clicked.dataset.name;
                            const idx = top3.findIndex(c => c.name === tName);
                            if (idx !== -1) {
                                const cardData = top3[idx];
                                const isRevolForm = cardData.name.toLowerCase().includes('revolform');
                                const isG2OrLessUnit = parseInt(cardData.grade) <= 2 && !cardData.skill?.includes('[Set Order]');

                                if (isRevolForm && !isG2OrLessUnit) {
                                    const removed = top3.splice(idx, 1)[0];
                                    const cardElem = createCardElement(removed);
                                    playerHand.appendChild(cardElem);
                                    updateHandSpacing();
                                    sendMoveData(cardElem);
                                    alert(`นำ ${removed.name} ขึ้นมือ!`);
                                    zoneViewer.classList.add('hidden');
                                    viewerGrid.removeEventListener('click', selListener);
                                    cleanupAndDone();
                                } else if (isRevolForm && isG2OrLessUnit) {
                                    if (confirm(`คุณต้องการเลือกนำ ${cardData.name} ขึ้นมือ (กด ตกลง) หรือคอลลงช่อง RC (กด ยกเลิก)?`)) {
                                        const removed = top3.splice(idx, 1)[0];
                                        const cardElem = createCardElement(removed);
                                        playerHand.appendChild(cardElem);
                                        updateHandSpacing();
                                        sendMoveData(cardElem);
                                        alert(`นำ ${removed.name} ขึ้นมือ!`);
                                        zoneViewer.classList.add('hidden');
                                        viewerGrid.removeEventListener('click', selListener);
                                        cleanupAndDone();
                                    } else {
                                        rcCallFlow(idx);
                                    }
                                } else if (!isRevolForm && isG2OrLessUnit) {
                                    rcCallFlow(idx);
                                } else {
                                    alert(`ไม่สามารถเลือกใบนี้ได้ (${cardData.name})`);
                                }

                                function rcCallFlow(cardIdx) {
                                    const cData = top3[cardIdx];
                                    alert(`เลือกคอล ${cData.name} กรุณาคลิกช่องวงกลม (RC) ที่ต้องการลง`);
                                    zoneViewer.classList.add('hidden');
                                    document.body.classList.add('targeting-mode');

                                    const rcCallListener = (ev) => {
                                        const circle = ev.target.closest('.circle.rc');
                                        if (circle) {
                                            ev.stopPropagation();
                                            document.removeEventListener('click', rcCallListener, true);
                                            document.body.classList.remove('targeting-mode');

                                            const removed = top3.splice(cardIdx, 1)[0];
                                            const existing = circle.querySelector('.card:not(.opponent-card)');
                                            if (existing) {
                                                document.querySelector('.my-side .drop-zone').appendChild(existing);
                                                existing.classList.remove('rest');
                                                sendMoveData(existing);
                                            }
                                            const newElem = createCardElement(removed);
                                            circle.appendChild(newElem);
                                            newElem.classList.remove('rest');
                                            newElem.style.transform = 'none';
                                            sendMoveData(newElem);
                                            applyStaticBonuses(newElem);
                                            alert(`คอล ${removed.name} สำเร็จ!`);
                                            viewerGrid.removeEventListener('click', selListener);
                                            cleanupAndDone();
                                        }
                                    };
                                    document.addEventListener('click', rcCallListener, true);
                                }
                            }
                        }
                    };

                    viewerGrid.addEventListener('click', selListener);
                    closeViewerBtn.onclick = () => { zoneViewer.classList.add('hidden'); viewerGrid.removeEventListener('click', selListener); cleanupAndDone(); };
                }
            }
        }


        // --- Charis (VC) ACT ---
        if (name.includes('Charis') && card.parentElement.classList.contains('vc')) {
            if (await vgConfirm("Charis: [ACT](VC) [SB1] จั่ว 2 และทิ้งการ์ด?")) {
                if (await paySoulBlast(1)) {
                    drawCard(true);
                    drawCard(true);

                    const handCards = Array.from(playerHand.querySelectorAll('.card'));
                    const orders = handCards.filter(c => c.dataset.skill && c.dataset.skill.includes('[Order]'));

                    let discarded = false;
                    if (orders.length > 0) {
                        if (await vgConfirm("Charis: คุณต้องการทิ้ง Order หรือไม่? (ถ้าไม่ทิ้งต้องทิ้งการ์ด 2 ใบ)")) {
                            alert("เลือก Order 1 ใบเพื่อทิ้ง");
                            document.body.classList.add('targeting-mode');
                            await new Promise(resolve => {
                                const orderDiscardListener = (e) => {
                                    const target = e.target.closest('.card');
                                    if (target && target.parentElement && target.parentElement.dataset.zone === 'hand' && target.dataset.skill.includes('[Order]')) {
                                        e.stopPropagation();
                                        const dropZone = document.querySelector('.my-side .drop-zone');
                                        dropZone.appendChild(target);
                                        sendMoveData(target);
                                        updateHandCount();
                                        updateDropCount();
                                        discarded = true;
                                        document.body.classList.remove('targeting-mode');
                                        document.removeEventListener('click', orderDiscardListener, true);
                                        resolve();
                                    }
                                };
                                document.addEventListener('click', orderDiscardListener, true);
                            });
                        }
                    }

                    if (!discarded) {
                        alert("เลือกการ์ด 2 ใบจากมือเพื่อทิ้ง");
                        for (let i = 0; i < 2; i++) {
                            document.body.classList.add('targeting-mode');
                            await new Promise(resolve => {
                                const normalDiscardListener = (e) => {
                                    const target = e.target.closest('.card');
                                    if (target && target.parentElement && target.parentElement.dataset.zone === 'hand') {
                                        e.stopPropagation();
                                        const dropZone = document.querySelector('.my-side .drop-zone');
                                        dropZone.appendChild(target);
                                        sendMoveData(target);
                                        updateHandCount();
                                        updateDropCount();
                                        document.body.classList.remove('targeting-mode');
                                        document.removeEventListener('click', normalDiscardListener, true);
                                        resolve();
                                    }
                                };
                                document.addEventListener('click', normalDiscardListener, true);
                            });
                        }
                    }
                    alert("Charis Skill: สำเร็จแล้ว!");
                    card.dataset.actUsed = "true";
                }
            }
        }

        // --- Lattice (RC) ACT ---
        if (name.includes('Lattice') && card.parentElement.classList.contains('rc')) {
            const vg = document.querySelector('.my-side .circle.vc .card');
            const oppVgElem = document.querySelector('.opponent-side .circle.vc .card');
            const oppGrade = oppVgElem ? parseInt(oppVgElem.dataset.grade) : 0;

            if (vg && vg.dataset.name.includes('Magnolia') && oppGrade >= 3) {
                if (await vgConfirm("Lattice: [ACT](RC) [CB1 & นำยูนิทนี้เข้าสู่โซล] เพื่อไรด Magnolia Elder เกรด 4 จากมือเป็น [Stand]?")) {
                    const elderInHand = Array.from(playerHand.querySelectorAll('.card')).find(c => c.dataset.name.includes('Elder') && parseInt(c.dataset.grade) === 4);

                    if (elderInHand) {
                        if (payCounterBlast(1)) {
                            // Cost: Put this into soul
                            soulPool.push(card);
                            sendMoveData(card, 'soul');
                            card.remove();
                            updateSoulUI();

                            // Ride Elder from hand
                            const vc = document.querySelector('.my-side .circle.vc');
                            const currentVG = vc.querySelector('.card');
                            if (currentVG) {
                                soulPool.push(currentVG);
                                sendMoveData(currentVG, 'soul');
                                currentVG.remove();
                            }
                            vc.appendChild(elderInHand);
                            elderInHand.classList.remove('rest');
                            elderInHand.style.transform = 'none';

                            applyStaticBonuses(elderInHand);
                            sendMoveData(elderInHand);
                            handleRideAbilities(elderInHand);
                            updateSoulUI();
                            alert("Lattice Skill: Magnolia Elder ปรากฏกาย!");
                        }
                    } else {
                        alert("ไม่พบ Magnolia Elder เกรด 4 บนมือของคุณ!");
                    }
                }
            } else {
                alert("เงื่อนไขไม่ครบ: ต้องมี Magnolia บนแวนการ์ดและแวนการ์ดคู่แข่งต้องเกรด 3 ขึ้นไป");
            }
        }

        // --- Spiritual Body Condensation [Order] ---
        if (name.includes('Spiritual Body Condensation')) {
            if (await vgConfirm("Spiritual Body Condensation: [SB1] นำ 1 ใบจากดร็อปโซนลง (RC) ใบนั้นรับพลัง +5000?")) {
                if (await paySoulBlast(1)) {
                    promptCallFromDrop(1, (c) => {
                        const vg = document.querySelector('.my-side .circle.vc .card');
                        const vgGrade = vg ? parseInt(vg.dataset.grade) : 0;
                        return parseInt(c.dataset.grade) <= vgGrade;
                    }, 5000);
                    return true;
                } else return false;
            } else return false;
        }

        // --- In the Dim Darkness, the Frozen Resentment [Order] ---
        if (name.includes('In the Dim Darkness')) {
            if (await vgConfirm("In the Dim Darkness: [SB1] ดู 3 ใบจากกองการ์ด นำ 1 ใบเข้ามือ นำ 1 ใบจากดร็อปลง (RC)?")) {
                if (await paySoulBlast(1)) {
                    const topCards = deckPool.slice(0, 3);
                    if (topCards.length > 0) {
                        openViewer("เลือกการ์ด 1 ใบเพื่อส่งลงดรอปโซน", topCards);
                        const discardSelector = async (e) => {
                            const clickedNode = e.target.closest('.card');
                            if (clickedNode && clickedNode.parentElement === viewerGrid) {
                                viewerGrid.removeEventListener('click', discardSelector);
                                const originalId = clickedNode.dataset.originalId;
                                const originalIdx = deckPool.findIndex(c => c.id === originalId);
                                if (originalIdx !== -1) {
                                    const discarded = deckPool.splice(originalIdx, 1)[0];
                                    deckPool.sort(() => 0.5 - Math.random());
                                    updateDeckCounter();
                                    const dropZone = document.querySelector('.my-side .drop-zone');
                                    const discardedElem = createCardElement(discarded);
                                    dropZone.appendChild(discardedElem);
                                    sendMoveData(discardedElem);
                                    updateDropCount();
                                    zoneViewer.classList.add('hidden');
                                    alert("Discarded card and shuffled deck. Now choose a card to call from drop.");
                                    promptCallFromDrop(1, (c) => {
                                        const vg = document.querySelector('.my-side .circle.vc .card');
                                        const vgGrade = vg ? parseInt(vg.dataset.grade) : 0;
                                        return parseInt(c.dataset.grade) <= vgGrade;
                                    }, 0);
                                }
                            }
                        };
                        viewerGrid.addEventListener('click', discardSelector);
                    } else {
                        alert("Deck is empty!");
                    }
                }
            }
        }

    }

    if (closeSkillBtn) {
        closeSkillBtn.onclick = () => skillViewer.classList.add('hidden');
    }

    async function triggerMunaSkill(munaCard) {
        if (munaCard.dataset.actUsed === "true") return;
        if (await vgConfirm("Muna: [SB1] เพื่อจั่วการ์ด 1 ใบ?")) {
            if (await paySoulBlast(1)) {
                munaCard.dataset.actUsed = "true"; // use 1/turn
                drawCard(true);
            }
        }
    }

    function handleIncomingData(data) {
        console.log('Data received:', data.type);
        const oppSide = document.querySelector('.opponent-side');

        switch (data.type) {
            case 'syncCounts':
                if (oppHandCountNum) oppHandCountNum.textContent = data.hand;
                if (oppDeckCountNum) oppDeckCountNum.textContent = data.deck;
                if (oppDropCountNum) oppDropCountNum.textContent = data.drop;
                if (oppDamageCountNum) oppDamageCountNum.textContent = data.damage;
                const oqDrop = document.getElementById('opp-quick-drop-num');
                const oqDamage = document.getElementById('opp-quick-damage-num');
                const oqOrder = document.getElementById('opp-quick-order-num');
                const oqBind = document.getElementById('opp-quick-bind-num');
                if (oqDrop) oqDrop.textContent = data.drop;
                if (oqDamage) oqDamage.textContent = data.damage;
                if (oqOrder) oqOrder.textContent = data.order || 0;
                if (oqBind) oqBind.textContent = data.bind || 0;
                if (oppSoulBadge) {
                    if (data.soul > 0) {
                        oppSoulBadge.classList.remove('hidden');
                        oppSoulBadge.textContent = `Soul: ${data.soul}`;
                        window.oppSoulPool = data.soulCards || [];
                    } else {
                        oppSoulBadge.classList.add('hidden');
                        window.oppSoulPool = [];
                    }
                }
                break;
            case 'moveCard':
                syncRemoteMove(data);
                break;
            case 'checkUpdateSeraph':
                updateAllStaticBonuses();
                updateAllPrisonUI();
                break;
            case 'prisonSync':
                updateAllPrisonUI();
                break;
            case 'forceImprisonSpecific':
                const localCardId = data.targetId.replace(/^opp-/, '');
                const myTarget = document.getElementById(localCardId);
                if (myTarget && !myTarget.classList.contains('opponent-card')) {
                    imprisonCard(myTarget);
                }
                break;
            case 'forceImprison':
                // Handles G2 Risatt Pink prompt: Opponent chooses 1 card from hand
                if (data.fromZone === 'hand') {
                    alert(`แจ้งเตือน: คู่แข่งใช้งานสกิลขังการ์ด กรุณาเลือกการ์ดจากมือ ${data.min} ใบเพื่อนำไปขังในคุกคู๋แข่ง`);
                    document.body.classList.add('targeting-mode');
                    let impCount = 0;
                    const handCards = document.querySelectorAll('#player-hand .card');
                    if(handCards.length === 0) {
                        alert("ไม่ต้องกังวล คุณไม่มีการ์ดในมือให้ขัง!");
                        document.body.classList.remove('targeting-mode');
                        sendData({ type: 'announce', msg: `ไม่มีการ์ดในมือให้ขัง!` });
                    } else {
                        const imprisonListener = (e) => {
                            const target = e.target.closest('#player-hand .card');
                            if (target) {
                                e.stopPropagation();
                                imprisonCard(target);  // Use our new helper!
                                impCount++;
                                updateAllStaticBonuses();
                                
                                if (impCount >= data.max) {
                                    document.body.classList.remove('targeting-mode');
                                    document.removeEventListener('click', imprisonListener, true);
                                    if (data.drawAfterMove) {
                                        drawCard(true);
                                        sendData({ type: 'announce', msg: `ลงคุกสำเร็จ คู่แข่งจั่วการ์ดชดเชย 1 ใบ!` });
                                        alert(`เลือกการ์ดขังครบแล้ว! และจั่ว 1 ใบจากผลของการ์ดคู่แข่ง`);
                                    } else {
                                        alert(`เลือกการ์ดขังครบแล้ว!`);
                                    }
                                }
                            }
                        };
                        document.addEventListener('click', imprisonListener, true);
                    }
                } else if (data.fromZone === 'drop') {
                    alert(`แจ้งเตือน: คู่แข่งใช้งานสกิลขังการ์ด กรุณาเลือกการ์ดจาก 'ดรอปโซน' ${data.min} ใบเพื่อนำไปขังในคุกคู๋แข่ง`);
                    document.body.classList.add('targeting-mode');
                    let impCount = 0;
                    const dropCards = document.querySelectorAll('.my-side .drop-zone .card');
                    if(dropCards.length === 0) {
                        alert("ไม่มีการ์ดในดรอปโซน!");
                        document.body.classList.remove('targeting-mode');
                        sendData({ type: 'announce', msg: `ไม่มีการ์ดในดรอปโซนให้ขัง!` });
                    } else {
                        const imprisonListener = (e) => {
                            const target = e.target.closest('.my-side .drop-zone .card');
                            if (target) {
                                e.stopPropagation();
                                const targetZone = document.querySelector('.opponent-side .order-zone');
                                if (targetZone) {
                                    targetZone.appendChild(target);
                                    target.classList.add('imprisoned-card');
                                    sendMoveData(target, 'order-zone');
                                    sendData({ type: 'checkUpdateSeraph' });
                                }
                                
                                impCount++;
                                updateDropCount();
                                updateAllStaticBonuses();
                                updateAllPrisonUI();
                                
                                if (impCount >= data.max) {
                                    document.body.classList.remove('targeting-mode');
                                    document.removeEventListener('click', imprisonListener, true);
                                    alert(`เลือกการ์ดขังลงคุกจากดรอปโซนครบแล้ว!`);
                                }
                            }
                        };
                        document.addEventListener('click', imprisonListener, true);
                    }
                } else if (data.fromZone === 'deck') {
                    if (deckPool.length > 0) {
                        // Deck is top-down (0 index = top)
                        const topCardData = deckPool.splice(0, 1)[0]; 
                        updateDeckCounter();
                        
                        const targetZone = document.querySelector('.opponent-side .order-zone');
                        const target = createCardElement(topCardData);
                        if (targetZone) {
                            targetZone.appendChild(target);
                            target.classList.add('imprisoned-card');
                            sendMoveData(target, 'order-zone');
                            sendData({ type: 'checkUpdateSeraph' });
                        }
                        updateAllStaticBonuses();
                        updateAllPrisonUI();
                        sendData({ type: 'announce', msg: `ถูกดึงใบบนสุดของกองลงคุกแล้ว!` });
                        alert("ถูกบังคับนำการ์ดใบบนสุดของกองการ์ดลงคุก!");
                    } else {
                        sendData({ type: 'announce', msg: `ไม่มีการ์ดในกองการ์ดให้ขัง!` });
                    }
                }
                break;
            case 'forceImprisonMass':
                (async () => {
                    const reqCount = data.count || 2;
                    alert(`⚠️ ประกาศจากศูนย์กักกัน: โดนสกิล Seraph Purelight!\nขังการ์ด มือ ${reqCount}, สนาม ${reqCount}, และโซล ${reqCount} ใบ!`);
                    
                    // 1. Hand
                    const handCards = Array.from(document.querySelectorAll('#player-hand .card'));
                    const handPick = Math.min(reqCount, handCards.length);
                    if (handPick > 0) {
                        alert(`กรุณาเลือกการ์ดจากมือ ${handPick} ใบ เพื่อนำไปขัง`);
                        document.body.classList.add('targeting-mode');
                        let picked = 0;
                        await new Promise(resolve => {
                            const listener = (e) => {
                                const target = e.target.closest('#player-hand .card');
                                if (target) {
                                    e.stopPropagation();
                                    imprisonCard(target);
                                    picked++;
                                    if (picked >= handPick) {
                                        document.body.classList.remove('targeting-mode');
                                        document.removeEventListener('click', listener, true);
                                        resolve();
                                    } else {
                                        alert(`ขังมือสำเร็จ! เลือกใบที่ ${picked + 1} จากมือ`);
                                    }
                                }
                            };
                            document.addEventListener('click', listener, true);
                        });
                    }

                    // 2. Rear-guard
                    const rgCards = Array.from(document.querySelectorAll('.my-side .circle.rc .card:not(.opponent-card)'));
                    const rgPick = Math.min(reqCount, rgCards.length);
                    if (rgPick > 0) {
                        alert(`กรุณาเลือกสนาม (RC) ${rgPick} ใบ เพื่อนำไปขัง`);
                        document.body.classList.add('targeting-mode');
                        let picked = 0;
                        await new Promise(resolve => {
                            const listener = (e) => {
                                const target = e.target.closest('.my-side .circle.rc .card:not(.opponent-card)');
                                if (target) {
                                    e.stopPropagation();
                                    imprisonCard(target);
                                    picked++;
                                    if (picked >= rgPick) {
                                        document.body.classList.remove('targeting-mode');
                                        document.removeEventListener('click', listener, true);
                                        resolve();
                                    } else {
                                        alert(`ขังสนามสำเร็จ! เลือกใบที่ ${picked + 1} จาก RC`);
                                    }
                                }
                            };
                            document.addEventListener('click', listener, true);
                        });
                    }

                    // 3. Soul
                    const soulPick = Math.min(reqCount, soulPool.length);
                    if (soulPick > 0) {
                        alert(`กรุณาเลือกการ์ดจากโซล ${soulPick} ใบ เพื่อนำไปขัง`);
                        let picked = 0;
                        await new Promise(resolve => {
                            openViewer(`เลือกไพ่จากโซลไปขังคุก (${soulPick} ใบ)`, soulPool, false);
                            const listener = (e) => {
                                const targetNode = e.target.closest('.viewer-grid .card');
                                if (targetNode) {
                                    e.stopPropagation();
                                    const originalId = targetNode.dataset.originalId;
                                    const cardIndex = soulPool.findIndex(c => c.id === originalId || c.dataset.originalId === originalId);
                                    if (cardIndex !== -1) {
                                        const removedCard = soulPool.splice(cardIndex, 1)[0];
                                        imprisonCard(removedCard);
                                        targetNode.classList.add('effect-retired');
                                        setTimeout(() => targetNode.remove(), 300);
                                        picked++;
                                        if (picked >= soulPick) {
                                            const viewer = document.getElementById('zone-viewer');
                                            if (viewer) viewer.classList.add('hidden');
                                            document.removeEventListener('click', listener, true);
                                            resolve();
                                        }
                                    }
                                }
                            };
                            document.addEventListener('click', listener, true);
                        });
                    }

                    updateSoulUI();
                    updateHandSpacing();
                    updateAllStaticBonuses();
                    updateAllPrisonUI();
                    sendData({ type: 'announce', msg: 'ขังคุกมวลชนตามคำสั่ง Seraph Purelight สำเร็จ!' });
                })();
                break;
            case 'removeCard':
                const remCard = document.getElementById(`opp-${data.cardId}`);
                if (remCard) {
                    remCard.classList.add('effect-retired');
                    setTimeout(() => remCard.remove(), 500);
                }
                break;
            case 'phaseChange':
                currentPhaseIndex = data.phaseIndex;
                updatePhaseUI(false);
                break;
            case 'nextTurn':
                currentTurn = data.currentTurn;
                currentPhaseIndex = 0;
                strategyActivatedThisTurn = false;
                shockStrategyActive = false;
                strategyActivatedCount = 0;
                window.promptedEndTurn = false;
                updatePhaseUI(false);
                break;
            case 'gameOver':
                showGameOver('Win');
                break;
            case 'declareAttack':
                showGuardDecision(data);
                break;
            case 'guardDecision':
                handleGuardDecision(data);
                break;
            case 'finishGuard':
                handleFinishGuard(data);
                break;
            case 'resolveAttack':
                resolveRemoteAttack(data);
                break;
            case 'revealDrive':
                showOpponentDriveCheck(data);
                break;
            case 'strategyActivated':
                strategyActivatedThisTurn = data.active;
                alert("คู่แข่งใช้งานความสามารถ Strategy / Skill!");
                updateAllStaticBonuses();
                break;
            case 'bruceStatus':
                isOpponentFinalRush = data.isFinalRush;
                isOpponentFinalBurst = data.isFinalBurst;
                isOpponentPersonaRide = data.isPersona || false;
                if (data.isFinalRush) alert("RIVAL ACTIVE: FINAL RUSH! 🏈🔥");
                if (data.isFinalBurst) alert("RIVAL ACTIVE: FINAL BURST! 🌋💥");
                updateStatusUI();
                break;
            case 'killshroudDebuff':
                window.killshroudDebuffActive = true;
                alert("คู่แข่งใช้งาน Killshroud: แวนการ์ดของคุณถูกลดพลัง! 💀📉");
                updateAllStaticBonuses();
                break;
            case 'hostAck': // Guest receives deck info from host
                if (data.deck === 'magnolia') {
                    // Host is Magnolia, Guest keeps Bruce (or whatever they picked)
                }
                console.log("Host deck info received:", data.deck);
                break;
            case 'rpsChoice':
                oppRpsChoice = data.choice;
                checkRpsResult();
                break;
            case 'mulliganReady':
                oppConfirmedMulligan = true;
                checkGameStart();
                break;
            case 'syncSoulCount':
                if (oppSoulBadge) {
                    oppSoulBadge.textContent = `Soul: ${data.count}`;
                    if (data.count > 0) oppSoulBadge.classList.remove('hidden');
                    else oppSoulBadge.classList.add('hidden');
                }
                break;
            case 'syncBindCount': {
                const bBadge = document.getElementById('opp-bind-counter');
                if (bBadge) {
                    bBadge.textContent = `Bind: ${data.count}`;
                    if (data.count > 0) bBadge.classList.remove('hidden');
                    else bBadge.classList.add('hidden');
                }
                const oqBind = document.getElementById('opp-quick-bind-num');
                if (oqBind) oqBind.textContent = data.count || 0;
                break;
            }
            case 'retireOpponentRG': // New case for Eden's skill
                promptOpponentRetireRG(data.attackerName);
                break;
            case 'announcePersona':
                isOpponentPersonaRide = true;
                alert("RIVAL ACTIVE: PERSONA RIDE! Their front row units gain +10000 Power!");
                updateAllStaticBonuses();
                break;
            case 'forceRetire':
                const frCard = document.getElementById(data.cardId) || document.getElementById(`opp-${data.cardId}`);
                if (frCard) {
                    frCard.classList.add('effect-retired');
                    setTimeout(() => {
                        const side = frCard.classList.contains('opponent-card') ? '.opponent-side' : '.my-side';
                        const dropZone = document.querySelector(`${side} .drop-zone`);
                        if (dropZone) dropZone.appendChild(frCard);
                        frCard.classList.remove('effect-retired', 'rest', 'face-down');
                        if (!frCard.classList.contains('opponent-card')) window.myRGRetiredThisTurn = true;
                        updateDropCount();
                        updateAllStaticBonuses();
                    }, 500);
                    alert(`ยูนิทฝั่ง ${frCard.classList.contains('opponent-card') ? 'ตรงข้าม' : 'ของคุณ'} ถูกรีไทร์!`);
                }
                break;
            case 'retireColumn':
                retireMyColumn(data.column);
                break;
            case 'forcePutBottom':
                const fpbCard = document.getElementById(data.cardId) || document.getElementById(`opp-${data.cardId}`);
                if (fpbCard) {
                    fpbCard.classList.add('effect-retired');
                    setTimeout(() => {
                        fpbCard.remove();
                    }, 500);
                    alert(`ยูนิทฝั่งคุณถูกนำกลับเข้าใต้กอง!`);
                }
                break;
            case 'announce':
                alert(data.msg);
                break;
            case 'emptyHack':
                break;
        }
    }

    function promptOpponentRetireRG(attackerName) {
        alert(`${attackerName}: เลือกเรียร์การ์ดของคุณ 1 ใบเพื่อรีไทร์ (Retire)`);
        document.body.classList.add('targeting-mode');

        const retireListener = (e) => {
            const targetRG = e.target.closest('.card:not(.opponent-card)');
            if (targetRG && targetRG.parentElement && targetRG.parentElement.classList.contains('rc')) {
                // Check for Resist
                if (isCardResistant(targetRG)) {
                    alert("ยูนิทนี้มีความสามารถ RESIST! ไม่สามารถเลือกได้โดยคู่แข่ง");
                    return;
                }
                e.stopPropagation();
                const dropZone = document.querySelector('.my-side .drop-zone');
                dropZone.appendChild(targetRG);
                window.myRGRetiredThisTurn = true;
                sendMoveData(targetRG); // Send back to attacker to confirm move to their drop
                updateDropCount();
                updateAllStaticBonuses();
                document.body.classList.remove('targeting-mode');
                document.removeEventListener('click', retireListener, true);
                alert("รีไทร์สำเร็จ!");
            } else if (targetRG && targetRG.classList.contains('opponent-card')) {
                alert("ต้องเลือกเรียร์การ์ดของตัวคุณเอง!");
            }
        };
        document.addEventListener('click', retireListener, true);
    }

    async function promptRetireColumn() {
        alert("Bram Vairina: เลือก 1 Column ของคุณ เพื่อรีไทร์ยูนิทคู่แข่งในแถวนั้นทั้งหมด");
        document.body.classList.add('targeting-mode');

        return new Promise(resolve => {
            const choiceListener = (e) => {
                const circle = e.target.closest('.my-side .circle');
                if (circle) {
                    const zone = circle.dataset.zone || "";
                    let col = null;
                    if (zone.includes('left')) col = 'left';
                    else if (zone.includes('right')) col = 'right';
                    else if (zone.includes('center')) col = 'center';

                    if (col) {
                        e.stopPropagation();
                        sendData({ type: 'retireColumn', column: col });
                        alert(`เลือกแถวตั้ง ${col}! ยูนิทคู่แข่งในแถวนั้นจะถูกรีไทร์`);
                        document.body.classList.remove('targeting-mode');
                        document.removeEventListener('click', choiceListener, true);
                        resolve(true);
                    }
                }
            };
            document.addEventListener('click', choiceListener, true);
        });
    }

    function retireMyColumn(column) {
        const colZones = column === 'left' ? ['rc_front_left', 'rc_back_left'] :
            column === 'right' ? ['rc_front_right', 'rc_back_right'] :
                ['vc', 'rc_back_center'];

        colZones.forEach(z => {
            const circle = document.querySelector(`.my-side .circle[data-zone="${z}"]`);
            if (circle) {
                const card = circle.querySelector('.card:not(.opponent-card)');
                if (card && !circle.classList.contains('vc')) {
                    if (isCardResistant(card)) {
                        alert(`ยูนิทในช่อง ${z} มี Resist! ไม่สามารถรีไทร์ได้`);
                        return;
                    }
                    const dropZone = document.querySelector('.my-side .drop-zone');

                    // Drop Materials first
                    if (card.unitSoul && card.unitSoul.length > 0) {
                        card.unitSoul.forEach(m => {
                            dropZone.appendChild(m);
                            sendMoveData(m);
                        });
                        card.unitSoul = [];
                    }

                    dropZone.appendChild(card);
                    card.classList.remove('rest');
                    sendMoveData(card);
                    updateDropCount();
                }
            }
        });
        alert(`แถวตั้ง ${column} ของคุณถูกรีไทร์แล้ว!`);
    }

    function promptGiunoslaPowerTransfer(giunoslaCard) {
        const currentPower = parseInt(giunoslaCard.dataset.power);
        alert(`Giunosla: เลือกเรียร์การ์ดใบอื่น 1 ใบเพื่อรับพลัง +${currentPower}`);
        document.body.classList.add('targeting-mode');

        const transferListener = (e) => {
            const targetRG = e.target.closest('.card:not(.opponent-card)');
            if (targetRG && targetRG !== giunoslaCard && targetRG.parentElement && targetRG.parentElement.classList.contains('rc')) {
                e.stopPropagation();
                targetRG.dataset.power = parseInt(targetRG.dataset.power) + currentPower;
                syncPowerDisplay(targetRG);
                sendMoveData(targetRG);
                alert(`${targetRG.dataset.name} ได้รับพลัง +${currentPower}!`);
                document.body.classList.remove('targeting-mode');
                document.removeEventListener('click', transferListener, true);
            } else if (targetRG === giunoslaCard) {
                alert("เลือกยูนิทใบอื่นที่ไม่ใช่ Giunosla ตัวนี้!");
            }
        };
        document.addEventListener('click', transferListener, true);
    }

    function showOpponentDriveCheck(data) {
        const cardData = data.cardData;
        const checkCard = createCardElement(cardData);
        checkCard.classList.add('opponent-card');
        checkCard.style.position = 'absolute';
        checkCard.style.top = '20%'; // Show it near the top of the screen
        checkCard.style.left = '50%';
        checkCard.style.zIndex = '9999';
        // Disable grabbing
        checkCard.draggable = false;
        checkCard.classList.add('effect-trigger'); // Apply trigger flash
        document.body.appendChild(checkCard);

        setTimeout(() => {
            checkCard.remove();
        }, 2000);
    }

    function showGuardDecision(attackData) {
        window.currentIncomingAttack = attackData; // Store globally for restrict check
        let overlay = document.getElementById('guard-decision-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'guard-decision-overlay';
            overlay.className = 'overlay glass-panel';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.flexDirection = 'column';
            overlay.style.zIndex = '10000';
            overlay.style.backgroundColor = 'rgba(0,0,0,0.9)';
            overlay.style.backdropFilter = 'blur(15px)';
            document.body.appendChild(overlay);
        }

        let restrictMsg = "";
        let isTotalRestrict = false;
        if (attackData.guardRestrictGrades && attackData.guardRestrictGrades.length > 0) {
            // Check if all grades (0-5) are restricted
            const gradesStr = attackData.guardRestrictGrades.map(g => g.toString());
            if (["0", "1", "2", "3", "4", "5"].every(g => gradesStr.includes(g))) {
                isTotalRestrict = true;
                restrictMsg = `<p style="color:#ff2a6d; font-weight:bold; font-size: 1.1rem; margin: 15px 0; text-transform: uppercase; letter-spacing: 1px;">!! GUARD RESTRICT !!<br><span style="font-size: 0.9rem;">ไม่สามารถคอลการ์ดจากมือลง (GC) ได้!</span></p>`;
            } else {
                restrictMsg += `<p style="color:#ff2a6d; font-weight:bold; margin-top:10px;">GUARD RESTRICT: ยูนิทมือเกรด ${attackData.guardRestrictGrades.join(', ')} คอลไม่ได้!</p>`;
            }
        }
        if (attackData.guardRestrictCount && attackData.guardRestrictCount > 1) {
            restrictMsg += `<p style="color:#ff2a6d; font-weight:bold; margin-top:5px;">GUARD RESTRICT: ต้อง Guard ด้วยการ์ดจากมือครั้งละ ${attackData.guardRestrictCount} ใบขึ้นไป!</p>`;
        }

        overlay.innerHTML = `
            <div class="mobile-guard-box" style="width: 90%; max-width: 500px; text-align: center; padding: 2rem; background: rgba(20,20,30,0.8); border: 2px solid var(--accent-vanguard); border-radius: 20px; box-shadow: 0 0 30px rgba(255, 42, 109, 0.4);">
                <h3 style="color: var(--accent-vanguard); font-family: 'Orbitron'; margin-bottom: 10px; font-size: 1.2rem;">INCOMING ATTACK!</h3>
                <h2 style="color: white; font-size: 1.5rem; font-family: 'Orbitron', sans-serif; text-shadow: 0 0 10px #f87171; margin-bottom: 30px;">
                    ${attackData.attackerName} (${attackData.totalPower}) → ${attackData.targetName}<br>
                    <span style="font-size: 1.1rem; color: gold; display: block; margin-top: 5px;">
                        Critical: ★${attackData.totalCritical || 1} | Drive Check: ${attackData.driveCount || 0}
                    </span>
                </h2>
                ${restrictMsg}
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <button id="btn-guard" class="glass-btn highlight-btn" style="padding: 1.2rem; font-size: 1.3rem; background: ${isTotalRestrict ? '#333' : 'var(--accent-blue)'}; color: ${isTotalRestrict ? '#777' : '#001020'}; border: ${isTotalRestrict ? '1px solid #555' : 'none'}; width: 100%; pointer-events: ${isTotalRestrict ? 'none' : 'auto'};" ${isTotalRestrict ? 'disabled' : ''}>${isTotalRestrict ? 'CANNOT GUARD' : 'GUARD'}</button>
                    <button id="btn-no-guard" class="glass-btn" style="padding: 1.2rem; font-size: 1.3rem; background: ${isTotalRestrict ? 'rgba(255, 42, 109, 0.3)' : 'rgba(248, 113, 113, 0.2)'}; color: ${isTotalRestrict ? '#fff' : '#fecaca'}; border: 1px solid ${isTotalRestrict ? 'var(--accent-vanguard)' : '#f87171'}; width: 100%; font-weight: ${isTotalRestrict ? 'bold' : 'normal'}; animation: ${isTotalRestrict ? 'pulse-vanguard 2s infinite' : 'none'};">NO GUARD</button>
                </div>
            </div>
        `;

        document.getElementById('btn-guard').addEventListener('click', () => {
            overlay.style.display = 'none';
            isGuarding = true;
            document.querySelectorAll('.guardian-circle').forEach(gc => gc.classList.add('zone-highlight'));
            sendData({ type: 'guardDecision', decision: 'guard', attackData: attackData });
            updateGCShield();
            showEndGuardButton(attackData);
        });

        document.getElementById('btn-no-guard').addEventListener('click', () => {
            overlay.style.display = 'none';
            window.currentIncomingAttack = null;
            isGuarding = false;
            
            if (isAIMode && !isMyTurn) {
                // AI is attacking, player chose NO GUARD
                window.playerGuardShield = 0;
                window.playerGuardIsPG = false;
                isWaitingForGuard = false;
            } else if (isAIMode && isMyTurn) {
                sendData({ type: 'guardDecision', decision: 'no-guard', attackData: attackData });
            } else {
                sendData({ type: 'guardDecision', decision: 'no-guard', attackData: attackData });
            }
            updateBattleHubUI();
        });

        overlay.style.display = 'flex';
    }

    function showEndGuardButton(attackData) {
        let btn = document.createElement('button');
        btn.innerHTML = "CONFIRM GUARD <span style='font-size: 0.8rem; display: block; opacity: 0.7;'>TAP CARD THEN GC</span>";
        btn.className = "btn glass-btn highlight-btn guard-confirm-btn";
        btn.style.position = "fixed";
        btn.style.bottom = "120px";
        btn.style.left = "50%";
        btn.style.transform = "translateX(-50%)";
        btn.style.zIndex = "2000";
        btn.style.padding = "1rem 2rem";
        btn.style.fontSize = "1.2rem";
        btn.style.width = "80%";
        btn.style.maxWidth = "300px";
        btn.style.boxShadow = "0 0 20px var(--accent-blue)";

        btn.onclick = () => {
            // Calculate Total Shield and PG check
            const gc = document.querySelector('.guardian-circle');
            const guardCards = gc ? gc.querySelectorAll('.card') : [];

            // Check Guard Restrict Count (Garou Vairina / Killshroud)
            const fromHandCount = Array.from(guardCards).filter(c => c.dataset.fromHand === "true").length;
            if (attackData.guardRestrictCount && attackData.guardRestrictCount > 1 && fromHandCount > 0 && fromHandCount < attackData.guardRestrictCount) {
                alert(`GUARD RESTRICT: ต้อง Guard ด้วยการ์ดจากบนมืออย่างน้อย ${attackData.guardRestrictCount} ใบ! (ตอนนี้เลือกไว้ ${fromHandCount} ใบ)`);
                alert("ระบบจะส่งการ์ดกลับขึ้นมือเพื่อให้คุณเลือก Guard ใหม่อีกครั้ง");

                // Return all guards to hand if restriction not met
                guardCards.forEach(c => {
                    const hand = document.getElementById('player-hand');
                    if (hand) {
                        hand.appendChild(c);
                        sendMoveData(c);
                    }
                });
                updateHandSpacing();
                updateGCShield();
                return; // Keep isGuarding = true and the button visible
            }

            // If check passed, proceed to finish guarding
            isGuarding = false;
            document.querySelectorAll('.guardian-circle').forEach(gc => gc.classList.remove('zone-highlight'));

            let totalShieldAdded = 0;
            let isPGActivated = false;

            guardCards.forEach(c => {
                let baseShield = parseInt(c.dataset.shield || "0");
                totalShieldAdded += baseShield;
                if (c.dataset.isPG === "true" || (c.dataset.name && c.dataset.name.includes("Perfect Guard"))) {
                    isPGActivated = true;
                }
                const dropZone = document.querySelector('.my-side .drop-zone');
                dropZone.appendChild(c);
                c.classList.remove('rest');
                sendMoveData(c);
            });
            updateDropCount();
            updateGCShield();
            updateBattleHubUI();

            btn.remove();
            if (isAIMode && !isMyTurn) {
                window.playerGuardShield = totalShieldAdded;
                window.playerGuardIsPG = isPGActivated;
                isWaitingForGuard = false;
            } else {
                sendData({
                    type: 'finishGuard',
                    attackData: attackData,
                    totalShield: totalShieldAdded,
                    isPG: isPGActivated
                });
            }
        };
        document.body.appendChild(btn);
    }

    async function triggerIvankaOnHitRC(attackData) {
        if (attackData.boosterName && attackData.boosterName.includes('Ivanka') && attackData.isTargetVanguard && isFinalRush) {
            setTimeout(async () => {
                if (await vgConfirm("Ivanka: [AUTO] เมื่อบูสต์ฮิตแวนการ์ด! [CB1 & นำเรียร์ที่ถูกบูสต์ไว้ใต้กอง] เพื่อจั่ว 1 และให้พลัง +5000 แก่ยูนิทอื่น?")) {
                    if (payCounterBlast(1)) {
                        const attackerElem = document.getElementById(attackData.attackerId);
                        if (attackerElem && attackerElem.parentElement.classList.contains('rc')) {
                            const cardInfo = {
                                name: attackerElem.dataset.name,
                                grade: parseInt(attackerElem.dataset.grade || "0"),
                                power: parseInt(attackerElem.dataset.power || "0"),
                                shield: parseInt(attackerElem.dataset.shield || "0"),
                                critical: parseInt(attackerElem.dataset.critical || "1"),
                                skill: attackerElem.dataset.skill || ""
                            };
                            if (deckPool) {
                                deckPool.push(cardInfo);
                                updateDeckCounter();
                            }
                            attackerElem.remove();
                            sendRemoveData(attackerElem);
                            alert("นำเรียร์การ์ดที่ถูกบูสต์กลับไปไว้ใต้กองการ์ดแล้ว");
                        }
                        drawCard(1);
                        alert("เลือกยูนิทอื่นเพื่อรับพลัง +5000 จนจบเทิร์น");
                        document.body.classList.add('targeting-mode');
                        const ivTarget = (e) => {
                            const targetUnit = e.target.closest('.card:not(.opponent-card)');
                            if (targetUnit) {
                                e.stopPropagation();
                                targetUnit.dataset.power = (parseInt(targetUnit.dataset.power) + 5000).toString();
                                syncPowerDisplay(targetUnit);
                                sendMoveData(targetUnit);
                                alert(`Ivanka: เพิ่มพลังให้ ${targetUnit.dataset.name} เรียบร้อย!`);
                                document.body.classList.remove('targeting-mode');
                                document.removeEventListener('click', ivTarget, true);
                            }
                        };
                        document.addEventListener('click', ivTarget, true);
                    }
                }
            }, 1000);
        }
    }

    async function handleBrachioforceEffect(attacker, attackData) {
        if (!attacker) return;

        const isPlayerSide = attacker.closest('.my-side') !== null;
        const sideClass = isPlayerSide ? '.my-side' : '.opponent-side';
        const oppSideClass = isPlayerSide ? '.opponent-side' : '.my-side';

        if (await vgConfirm("Brachioforce: [AUTO](RC) เมื่อโจมตีฮิต [Retire ยูนิตนี้] จั่ว 1 ใบ และเลือกไทร์ RG คู่แข่ง 1 ใบ?")) {
            const dropZone = document.querySelector(`${sideClass} .drop-zone`);
            if (dropZone) {
                dropZone.appendChild(attacker);
            }
            attacker.classList.remove('rest', 'attacking-glow');
            sendMoveData(attacker);
            updateDropCount();

            // Draw for the side that used the skill
            if (isPlayerSide) {
                drawCard(1);
            } else if (isAIMode) {
                if (aiDeck.length > 0) {
                    aiHand.push(aiDeck.pop());
                }
                syncAIStateToUI();
                updateDeckCounter();
            }

            // Retire opponent RG
            if (isAIMode) {
                const oppRGs = Array.from(document.querySelectorAll(`${oppSideClass} .circle.rc .card`));
                if (oppRGs.length > 0) {
                    // Simple AI: Retire first found RG
                    const target = oppRGs[0];
                    const oppDrop = document.querySelector(`${oppSideClass} .drop-zone`);
                    if (oppDrop) oppDrop.appendChild(target);
                    if (!isPlayerSide) {
                        // AI used skill, retired player RG
                        alert(`AI Brachioforce retires: ${target.dataset.name}`);
                    } else {
                        // Player used skill, retired AI RG
                        const cardDataStr = target.dataset.cardData;
                        if (cardDataStr) {
                            try {
                                aiDrop.push(JSON.parse(cardDataStr));
                            } catch (e) { }
                        }
                        alert(`Brachioforce retires AI unit: ${target.dataset.name}`);
                    }
                    target.classList.remove('rest');
                    sendMoveData(target);
                    updateDropCount();
                }
            } else {
                alert("Brachioforce: จั่วการ์ด 1 ใบเรียบร้อย! โปรดแจ้งให้คู่แข่งรีไทร์เรียร์การ์ด 1 ใบ");
            }
        }
    }

    async function handleGuardDecision(data) {
        if (currentAttackResolving) return;

        const decision = data.decision;
        const attackData = data.attackData;
        const statusText = document.getElementById('game-status-text');
        if (statusText) statusText.textContent = "Network Ready";

        if (decision === 'no-guard') {
            currentAttackResolving = true;
            alert("Opponent chose: NO GUARD!");
            if (attackData.isVanguardAttacker) {
                currentAttackData = { ...attackData, opponentShield: 0 };
                const grade = parseInt(attackData.vanguardGrade || "0");
                let checks = attackData.driveCount !== undefined ? attackData.driveCount : (grade >= 4 ? 3 : (grade >= 3 ? 2 : 1));
                if (attackData.tripleDrive) checks = Math.max(checks, 3);
                if (attackData.majestyDriveBuff) checks++;
                driveCheck(checks, attackData.totalCritical);
            } else {
                // Rearguard attack check vs base target power
                const attacker = document.getElementById(attackData.attackerId);
                const target = isAIMode ? 
                    document.querySelector(`.opponent-side .circle[data-zone="${attackData.targetId}"] .card`) :
                    (document.getElementById('opp-' + attackData.targetId) || document.querySelector(`.opponent-side .circle[data-zone="${attackData.targetId}"] .card`));
                
                let isHit = false;
                const attackerPower = parseInt(attackData.totalPower || "0");
                if (target) {
                    const targetPower = parseInt(target.dataset.power || "0");
                    isHit = attackerPower >= targetPower;
                } else {
                    isHit = true; // Fallback if rearguard target not found
                }

                if (isHit) {
                    alert("Rearguard attack hit! Resolving damage/retire...");
                    // Eden On-Hit Retirement
                    if (attackData.attackerName.includes('Eden') && isFinalRush) {
                        setTimeout(async () => {
                            if (await vgConfirm("Eden: Cost CB 1 to retire an opponent's Rear-guard?")) {
                                if (payCounterBlast(1)) {
                                    sendData({ type: 'retireOpponentRG', attackerName: attackData.attackerName });
                                    alert("Eden: Opponent is choosing a Rear-guard to retire.");
                                } else {
                                    alert("Eden: Counter Blast not paid. Ability not activated.");
                                }
                            }
                        }, 500);
                    }
                    triggerIvankaOnHitRC(attackData);
                } else {
                    alert("Rearguard attack missed.");
                }

                await sendData({ type: 'resolveAttack', attackData: { ...attackData, isHit: isHit } });
                await handleEndOfBattle(attacker, attackData);
            }
            currentAttackResolving = false;
            isWaitingForGuard = false;
            checkAllAttackersRested();
        } else if (decision === 'guard') {
            alert("Opponent chose: GUARD! They are placing defending units now. Await their confirmation.");
        }
    }

    async function handleFinishGuard(data) {
        const attackData = data.attackData;
        const totalShield = data.totalShield || 0;
        alert(`Opponent finished placing guards! (+${totalShield} Shield)`);

        const statusText = document.getElementById('game-status-text');
        if (statusText) statusText.textContent = "Network Ready";

        currentAttackData = {
            ...attackData,
            opponentShield: totalShield
        };

        if (attackData.isVanguardAttacker) {
            const grade = parseInt(attackData.vanguardGrade || "0");
            let checks = attackData.driveCount !== undefined ? attackData.driveCount : (grade >= 4 ? 3 : (grade >= 3 ? 2 : 1));
            if (attackData.tripleDrive) checks = Math.max(checks, 3);
            if (attackData.majestyDriveBuff) checks++;
            driveCheck(checks, attackData.totalCritical, data.isPG); // Pass PG to driveCheck
        } else {
            const attacker = document.getElementById(attackData.attackerId);
            const driveAdded = attacker ? parseInt(attacker.dataset.driveAdded || "0") : 0;
            if (attacker && (attacker.dataset.baurDriveCheck === "true" || driveAdded > 0 || window.otKeterActive)) {
                let rcChecks = driveAdded > 0 ? driveAdded : 1;
                if (window.otKeterActive) rcChecks = Math.max(rcChecks, 1);
                driveCheck(rcChecks, attackData.totalCritical, data.isPG);
            } else {
                // Recalculate Rearguard attack hit immediately
                const target = isAIMode ? 
                    document.querySelector(`.opponent-side .circle[data-zone="${attackData.targetId}"] .card`) :
                    (document.getElementById('opp-' + attackData.targetId) || document.querySelector(`.opponent-side .circle[data-zone="${attackData.targetId}"] .card`));
                
                let finalPower = attacker ? parseInt(attacker.dataset.power) + (attackData.boostPower || 0) : parseInt(attackData.totalPower || "0");
                let isHit = false;

                if (target) {
                    let targetDefPower = parseInt(target.dataset.power) + (data.totalShield || 0);
                    isHit = finalPower >= targetDefPower;
                } else {
                    isHit = true; 
                }

                if (data.isPG) {
                    alert("Perfect Guard nullified the Rear-guard attack!");
                    isHit = false;
                }

                if (isHit) {
                    // Eden On-Hit Retirement
                    if (attackData.attackerName.includes('Eden') && isFinalRush) {
                        setTimeout(async () => {
                            if (await vgConfirm("Eden: Cost CB 1 to retire an opponent's Rear-guard?")) {
                                if (payCounterBlast(1)) {
                                    sendData({ type: 'retireOpponentRG', attackerName: attackData.attackerName });
                                    alert("Eden: Opponent is choosing a Rear-guard to retire.");
                                }
                            }
                        }, 500);
                    }
                    triggerIvankaOnHitRC(attackData);
                    if (attackData.attackerName && attackData.attackerName.includes('Brachioforce')) {
                        await handleBrachioforceEffect(attacker, attackData);
                    }
                }

                await handleEndOfBattle(attacker, attackData);
                await sendData({ type: 'resolveAttack', attackData: { ...currentAttackData, isHit: isHit, isPG: data.isPG } });

                isGuarding = false;
                updateBattleHubUI();

                setTimeout(() => {
                    isWaitingForGuard = false;
                    currentAttackResolving = false;
                    checkAllAttackersRested();
                }, 500);
            }
            currentAttackData = null;
        }
    }

    async function handleEndOfBattle(attacker, attackData) {
        if (!attacker) return;
        window.richterSkillUsedThisAttack = false; // Reset for this attack resolution

        const name = (attacker.dataset.name || "").toLowerCase();
        const isMyTurn = (attacker.dataset.side !== 'opponent');
        const queue = [];

        // --- Youthberk RevolDress (End of Battle) ---
        if (attacker.parentElement.classList.contains('vc') && name.includes('skyfall arms')) {
            const handRevolForms = Array.from(playerHand.querySelectorAll('.card')).filter(c => c.dataset.name.toLowerCase().includes('revolform'));
            if (handRevolForms.length > 0) {
                if (await vgConfirm("RevolDress: [AUTO](VC) เมื่อจบการต่อสู้ ไรด์ 'RevolForm' จากมือเป็น Stand? (Drive -2 จนจบเทิร์น)")) {
                    openViewer("เลือก RevolForm เพื่อ Ride", handRevolForms.map(c => JSON.parse(c.dataset.cardData)));
                    await new Promise(resolve => {
                        const selListener = async (ev) => {
                            const clicked = ev.target.closest('.card');
                            if (clicked && clicked.parentElement === viewerGrid) {
                                viewerGrid.removeEventListener('click', selListener);
                                zoneViewer.classList.add('hidden');

                                const chosenName = clicked.dataset.name;
                                const handCard = handRevolForms.find(c => c.dataset.name === chosenName);
                                if (handCard) {
                                    handCard.remove();
                                    updateHandSpacing();

                                    const vc = document.querySelector('.my-side .circle.vc');
                                    attacker.remove();
                                    soulPool.push(attacker);
                                    sendMoveData(attacker, 'soul');

                                    vc.appendChild(handCard);
                                    handCard.classList.remove('rest');
                                    handCard.dataset.fromHand = "true";
                                    let currentDrive = parseInt(handCard.dataset.drive || "2");
                                    handCard.dataset.drive = Math.max(0, currentDrive - 2);
                                    handCard.dataset.isRevolDressRide = "true";

                                    // Trigger On-Place RevolDress Skills
                                    await checkRevolDressOnPlace(handCard);

                                    updateSoulUI();
                                    applyStaticBonuses(handCard);
                                    sendMoveData(handCard);
                                    updatePhaseUI(true);
                                    alert(`RevolDress สำเร็จ! ไรด์ ${chosenName} แล้ว (Drive ${handCard.dataset.drive})`);
                                }
                                resolve();
                            }
                        };
                        viewerGrid.addEventListener('click', selListener);
                        closeViewerBtn.onclick = () => { zoneViewer.classList.add('hidden'); resolve(); };
                    });
                    return; // Skip other VC effects if RevolDress used
                }
            }
        }

        // --- Avaricious Demonic Dragon (Greedon & Greedon Masques) [AUTO](VC) ---
        if (name.includes('greedon') && attacker.parentElement.classList.contains('vc')) {
            const isMasques = name.includes('masques');
            const standingRGs = Array.from(document.querySelectorAll('.my-side .circle.rc .card:not(.rest)'));
            const reqRGs = isMasques ? 3 : 4;
            const hasDesireDevilsInSoul = soulPool.filter(c => (c.dataset.name || "").toLowerCase().includes('desire devil')).length >= 3;

            // Masques requires 3 Desire Devils in Soul
            if (isMasques && !hasDesireDevilsInSoul) {
                // Cannot stand
            } else if (standingRGs.length >= reqRGs && !attacker.dataset.greedonStandUsedThisAttack) {
                const skillLabel = isMasques ? "Greedon Masques" : "Greedon";
                const costMsg = isMasques ? `[นำ Stand RGs ${reqRGs} ใบเข้าโซล] เพื่อ Stand แวนการ์ด?` : `[SB2 & นำ Stand RGs ${reqRGs} ใบเข้าโซล] เพื่อ Stand แวนการ์ด?`;

                if (await vgConfirm(`${skillLabel}: ${costMsg}`)) {
                    let costPaid = false;
                    if (isMasques) costPaid = true;
                    else costPaid = await paySoulBlast(2);

                    if (costPaid) {
                        let selectedCount = 0;
                        alert(`เลือกเรียร์การ์ดที่สแตนด์อยู่ ${reqRGs} ใบเพื่อนำเข้าโซล`);
                        document.body.classList.add('targeting-mode');

                        await new Promise(resolveGreedonCost => {
                            const rgListener = (e) => {
                                const card = e.target.closest('.my-side .circle.rc .card:not(.rest)');
                                if (card) {
                                    if (card.dataset.mousheenImmune === "true") {
                                        alert("Desire Devil, Mousheen ใบนี้ติดสถานะ Immune อยู่ จึงถูกนำเข้าโซลโดยสกิลแวนการ์ดไม่ได้!");
                                        return;
                                    }
                                    soulPool.push(card);
                                    card.remove();
                                    sendMoveData(card, 'soul');
                                    selectedCount++;

                                    // Handle Desire Devil Soul-in Triggers
                                    const cName = card.dataset.name.toLowerCase();
                                    if (cName.includes('gouman')) {
                                        const oppVG = document.querySelector('.opponent-side .circle.vc .card');
                                        if (oppVG && parseInt(oppVG.dataset.grade || "0") >= 3) {
                                            queue.push({
                                                name: 'Gouman Soul Skill',
                                                description: "[CB1] Guard Restrict (2+ cards)",
                                                resolve: async (done) => {
                                                    if (await vgConfirm("Gouman: [CB1] เพื่อเปิดใช้งาน Guard Restrict (ต้องคอล 2 ใบขึ้นไป)?")) {
                                                        if (payCounterBlast(1)) window.activeGuardRestrictCount = 2;
                                                    }
                                                    if (done) done();
                                                }
                                            });
                                        }
                                    }

                                    if (cName.includes('xitto')) {
                                        queue.push({
                                            name: 'Xitto Soul-In Skill',
                                            description: "นำการ์ดจากดรอปเข้าโซล",
                                            resolve: async (done) => {
                                                const myDrop = Array.from(document.querySelectorAll('.my-side .drop-zone .card')).map(node => node.dataset.name);
                                                if (myDrop.length > 0) {
                                                    if (await vgConfirm("Desire Devil, Xitto: [AUTO] เมื่อถูกนำเข้าโซลโดยแวนการ์ด เลือกการ์ด 1 ใบจากดรอปเพื่อนำเข้าโซล?")) {
                                                        const dropCards = Array.from(document.querySelectorAll('.my-side .drop-zone .card'));
                                                        const cardDataList = dropCards.map(c => ({ name: c.dataset.name, id: c.id }));

                                                        alert("เลือกการ์ดจาก drop zone เพื่อนำเข้าโซล");
                                                        openViewer("Choose a card to put into Soul", cardDataList);

                                                        await new Promise(resolveXitto => {
                                                            const selXitto = (ev) => {
                                                                const clicked = ev.target.closest('.card');
                                                                if (clicked && clicked.parentElement === viewerGrid) {
                                                                    viewerGrid.removeEventListener('click', selXitto);
                                                                    zoneViewer.classList.add('hidden');

                                                                    const realCard = document.getElementById(clicked.id);
                                                                    if (realCard) {
                                                                        soulPool.push(realCard);
                                                                        realCard.remove();
                                                                        sendMoveData(realCard, 'soul');
                                                                        updateSoulUI();
                                                                        updateCountsUI();
                                                                        alert(`นำ ${realCard.dataset.name} เข้าโซลแล้ว!`);
                                                                    }
                                                                    resolveXitto();
                                                                }
                                                            };
                                                            viewerGrid.addEventListener('click', selXitto);
                                                            closeViewerBtn.onclick = () => { zoneViewer.classList.add('hidden'); resolveXitto(); };
                                                        });
                                                    }
                                                }
                                                if (done) done();
                                            }
                                        });
                                    }

                                    if (cName.includes('fuujo')) {
                                        queue.push({
                                            name: 'Fuujo Soul-In Skill',
                                            description: "เลือกยูนิทคู่แข่ง 1 ใบเพื่อรีไทร์",
                                            resolve: async (done) => {
                                                const oppRGs = Array.from(document.querySelectorAll('.opponent-side .circle.rc .card'));
                                                const valid = oppRGs.filter(c => !isCardResistant(c));
                                                if (valid.length > 0) {
                                                    if (await vgConfirm("Fuujo: [AUTO] เมื่อถูกนำเข้าโซลโดยแวนการ์ด Greedon เลือกเรียร์การ์ดคู่แข่ง 1 ใบเพื่อรีไทร์?")) {
                                                        alert("เลือกเรียร์การ์ดคู่แข่งเพื่อรีไทร์");
                                                        document.body.classList.add('targeting-mode');
                                                        await new Promise(res => {
                                                            const h = (ev) => {
                                                                const t = ev.target.closest('.opponent-side .circle.rc .card');
                                                                if (t) {
                                                                    if (isCardResistant(t)) {
                                                                        alert("ยูนิทนี้มี Resist! เลือกไม่ได้");
                                                                        return;
                                                                    }
                                                                    ev.stopPropagation();
                                                                    const oppDrop = document.querySelector('.opponent-side .drop-zone');
                                                                    oppDrop.appendChild(t);
                                                                    sendMoveData(t);
                                                                    alert("รีไทร์สำเร็จ!");
                                                                    document.body.classList.remove('targeting-mode');
                                                                    document.removeEventListener('click', h, true);
                                                                    res();
                                                                }
                                                            };
                                                            document.addEventListener('click', h, true);
                                                        });
                                                    }
                                                }
                                                if (done) done();
                                            }
                                        });
                                    }

                                    if (selectedCount >= reqRGs) {
                                        document.body.classList.remove('targeting-mode');
                                        document.removeEventListener('click', rgListener);
                                        updateSoulUI();


                                        attacker.classList.remove('rest');
                                        attacker.style.transform = 'none';

                                        let pwr = isMasques ? 5000 : (soulPool.length >= 10 ? 15000 : 0);
                                        if (pwr > 0) {
                                            attacker.dataset.power = (parseInt(attacker.dataset.power) + pwr).toString();
                                            attacker.dataset.turnEndBuffPower = (parseInt(attacker.dataset.turnEndBuffPower || "0") + pwr).toString();
                                            attacker.dataset.turnEndBuffActive = "true";
                                            syncPowerDisplay(attacker);
                                            alert(`${skillLabel} Restand! พลัง +${pwr}`);
                                        } else {
                                            alert(`${skillLabel} Restand!`);
                                        }
                                        sendMoveData(attacker);
                                        attacker.dataset.greedonStandUsedThisAttack = "true";
                                        resolveGreedonCost();
                                    }
                                }
                            };
                            document.addEventListener('click', rgListener);
                        });
                    }
                }
            }
        }

        // --- Dragonic Overlord the End [AUTO](VC)[1/turn] ---
        if (name.includes('dragonic overlord the end') && attacker.parentElement.classList.contains('vc')) {
            if (attacker.dataset.doteStandUsed !== "true") {
                if (await vgConfirm("Dragonic Overlord the End: [AUTO](VC) เมื่อจบการต่อสู้ จ่าย [CB1 & ทิ้ง 2 ใบ] เพื่อ Stand กลับมาและไดร์ฟ -1?")) {
                    if (payCounterBlast(1)) {
                        await payDiscard(2);
                        attacker.classList.remove('rest');
                        attacker.dataset.doteStandUsed = "true";

                        const hasOverlordInSoul = soulPool.some(c => c.dataset.name && c.dataset.name.includes('Overlord'));
                        if (!hasOverlordInSoul) {
                            attacker.dataset.drive = Math.max(0, parseInt(attacker.dataset.drive || "2") - 1);
                            alert("Dragonic Overlord the End Stand! (Drive -1)");
                        } else {
                            alert("Dragonic Overlord the End Stand! (ไดร์ฟไม่ลดลงเพราะมี Overlord ในโซล)");
                        }

                        applyStaticBonuses(attacker);
                        sendMoveData(attacker);
                    }
                }
            }
        }

        // --- Richter End of Battle: Order abilities ---
        if (name.includes('richter') && attacker.dataset.avantStandReady === "true") {
            const hasSora = soulPool.some(c => (c.dataset.name || "").includes('Sora Period'));
            const baseAvant = bindPool.find(c => c.dataset.name.includes('"Skyrender" Avantgarda'));
            const isHitVG = attackData.isHit && attackData.isTargetVanguard;
            const isPersona = personaRideActive;

            const canUseRichterSkill = hasSora && baseAvant && 
                                       playerHand.querySelectorAll('.card').length >= 2 && 
                                       !window.richterRideBackUsedThisTurn;
            const canUseAvantRestand = (isHitVG || isPersona) && 
                                       !window.avantRestandUsedThisTurn;

            if (canUseAvantRestand) {
                queue.push({
                    name: "Avantgarda (Inherited AUTO): Restand",
                    description: "[CB1 & ทิ้ง 1 ใบ] Stand และ Drive-1",
                    resolve: async (done) => {
                        if (window.richterSkillUsedThisAttack) { if (done) done(); return; }
                        const handCount = playerHand.querySelectorAll('.card').length;
                        const openDamage = document.querySelectorAll('.my-side .damage-zone .card:not(.face-down)').length;
                        if (handCount >= 1 && openDamage >= 1) {
                            if (await vgConfirm("Avantgarda Skill: [CB1 & ทิ้งมือ 1 ใบ] เพื่อ Stand?")) {
                                if (await payDiscard(1)) {
                                    if (payCounterBlast(1)) {
                                        attacker.classList.remove('rest');
                                        window.avantRestandUsedThisTurn = true;
                                        window.richterSkillUsedThisAttack = true;
                                        let currentDrive = parseInt(attacker.dataset.drive || "2");
                                        attacker.dataset.drive = Math.max(0, currentDrive - 1).toString();
                                        alert("Richter (Avantgarda Skill): Stand! Drive = " + attacker.dataset.drive);
                                        sendMoveData(attacker);
                                    }
                                }
                            }
                        } else {
                            alert("คอสต์ไม่เพียงพอสำหรับ Restand! (ต้องการ CB1 + ทิ้ง 1 ใบ)");
                        }
                        if (done) done();
                    }
                });
            }

            if (canUseRichterSkill) {
                queue.push({
                    name: "Richter AUTO: Ride Back",
                    description: "[ทิ้งการ์ด 2 ใบ] ไรด์ Avantgarda จากไบนด์แบบ Stand + Power+10000 + Drive-1",
                    resolve: async (done) => {
                        if (window.richterSkillUsedThisAttack) { if (done) done(); return; }
                        if (await vgConfirm("Richter: [ทิ้ง 2 ใบ] ไรด์ Avantgarda จากไบนด์แบบ [Stand]?")) {
                            if (await payDiscard(2)) {
                                const idx = bindPool.indexOf(baseAvant);
                                if (idx !== -1) {
                                    bindPool.splice(idx, 1);
                                    const vc = document.querySelector('.my-side .circle.vc');
                                    const oldAttacker = attacker;

                                    oldAttacker.remove();
                                    soulPool.push(oldAttacker);
                                    sendMoveData(oldAttacker, 'soul');

                                    vc.appendChild(baseAvant);
                                    baseAvant.classList.remove('rest');
                                    baseAvant.dataset.power = (parseInt(baseAvant.dataset.power) + 10000).toString();
                                    baseAvant.dataset.drive = "1";
                                    baseAvant.dataset.avantStandReady = "true";
                                    
                                    window.richterRideBackUsedThisTurn = true;
                                    window.richterSkillUsedThisAttack = true;

                                    syncPowerDisplay(baseAvant);
                                    updateAllStaticBonuses();
                                    updateSoulUI();
                                    sendMoveData(baseAvant);
                                    sendData({ type: 'syncBindCount', count: bindPool.length });
                                    alert("Richter → Avantgarda: Ride สำเร็จ! Power +10000 / Drive -1 / Restand!");
                                }
                            }
                        }
                        if (done) done();
                    }
                });
            }
        }

        // --- Painkiller Angel (End of Battle) ---
        if (name.includes('painkiller angel') && attacker.classList.contains('rest')) {
            if (await vgConfirm("Painkiller Angel: [SB1 & Retire] เพื่อจั่ว 1 ใบ?")) {
                if (paySoulBlast(1)) {
                    const dropZone = document.querySelector('.my-side .drop-zone');
                    dropZone.appendChild(attacker);
                    attacker.classList.remove('rest');
                    sendMoveData(attacker);
                    drawCard(1);
                    updateDropCount();
                    alert("Painkiller Angel: จั่วการ์ด 1 ใบ");
                    return;
                }
            }
        }

        // --- Ordeal Dragon (End of Battle) ---
        if (name.includes('ordeal dragon') && attackData.isHit && attacker.parentElement.classList.contains('rc')) {
            if (playerHand.querySelectorAll('.card').length === 0) {
                if (await vgConfirm("Ordeal Dragon: [ทิ้ง 0 ใบ] ดูบนสุด 7 ใบหา 'Blaster'?")) {
                    if (deckPool.length < 7) { alert("กองการ์ดเหลือน้อยเกินไป!"); return; }
                    const top7 = deckPool.slice(0, 7);
                    openViewer("เลือก Ordeal Dragon: Top 7", top7);
                    const sel = (e) => {
                        const clicked = e.target.closest('.card');
                        if (clicked && clicked.parentElement === viewerGrid) {
                            const cName = clicked.dataset.name;
                            if (cName.includes('Blaster')) {
                                viewerGrid.removeEventListener('click', sel);
                                zoneViewer.classList.add('hidden');

                                const id = clicked.dataset.originalId;
                                const idx = deckPool.findIndex(c => c.id === id);
                                if (idx !== -1) {
                                    const chosen = deckPool.splice(idx, 1)[0];
                                    const cardNode = createCardElement(chosen);
                                    playerHand.appendChild(cardNode);
                                    updateHandSpacing();
                                    sendMoveData(cardNode);
                                    alert(`นำ ${cName} ขึ้นมือ!`);
                                }
                                deckPool.sort(() => 0.5 - Math.random());
                                updateDeckCounter();
                            }
                        }
                    };
                    viewerGrid.addEventListener('click', sel);
                    const closeH = () => {
                        deckPool.sort(() => 0.5 - Math.random());
                        updateDeckCounter();
                        closeViewerBtn.removeEventListener('click', closeH);
                    };
                    closeViewerBtn.addEventListener('click', closeH);
                    return;
                }
            }
        }

        // --- Cordiela Post-Battle Booster ---
        const boosterId = attackData.boosterId;
        if (boosterId) {
            const booster = document.getElementById(boosterId);
            if (booster && booster.dataset.name.includes('Cordiela') && booster.parentElement.dataset.zone === 'rc_back_center') {
                const vgNode = document.querySelector('.my-side .circle.vc .card');
                if (vgNode && vgNode.dataset.name.includes('Majesty')) {
                    if (await vgConfirm("Cordiela: [CB1] คอล Blade และ Dark จากโซลลงคอลัมน์เดียวกัน?")) {
                        if (payCounterBlast(1)) {
                            const hasBlade = soulPool.some(c => c.dataset.name.includes('Blaster Blade'));
                            const hasDark = soulPool.some(c => c.dataset.name.includes('Blaster Dark'));

                            let mode = "both";
                            if (hasBlade && hasDark) {
                                if (!await vgConfirm("ยืนยันคอล 'ทั้งสองใบ' ใช่หรือไม่? (กด CANCEL เพื่อเลือกเพียงใบเดียว)")) {
                                    mode = await vgConfirm("คอลเฉพาะ 'Blaster Blade' ใช่หรือไม่? (กด CANCEL เพื่อคอล Blaster Dark)") ? "blade" : "dark";
                                }
                            }

                            alert(`เลือกคอลัมน์ที่ต้องการคอล ${mode === "both" ? "(ซ้ายหรือขวา)" : "ยูนิท"}`);
                            showColumnSelection(async (col) => {
                                if (!col || col === 'center') return;
                                const fZone = col === 'left' ? 'rc_front_left' : 'rc_front_right';
                                const bZone = col === 'left' ? 'rc_back_left' : 'rc_back_right';
                                const fCirc = document.querySelector(`.my-side .circle[data-zone="${fZone}"]`);
                                const bCirc = document.querySelector(`.my-side .circle[data-zone="${bZone}"]`);

                                if (mode === "both" && (fCirc.querySelector('.card') || bCirc.querySelector('.card'))) {
                                    alert("คอลัมน์นี้ไม่ว่าง! ไม่สามารถคอลได้ทั้งสองใบ");
                                    return;
                                }

                                if (mode === "both" || mode === "blade") {
                                    const bladeIdx = soulPool.findIndex(c => c.dataset.name.includes('Blaster Blade'));
                                    if (bladeIdx !== -1) {
                                        if (fCirc.querySelector('.card')) {
                                            alert("ช่องหน้าไม่ว่าง! คอลไม่ได้");
                                        } else {
                                            const c = soulPool.splice(bladeIdx, 1)[0];
                                            fCirc.appendChild(c);
                                            c.classList.remove('rest');
                                            applyStaticBonuses(c);
                                            sendMoveData(c);
                                            await checkOnPlaceAbilities(c, 'soul'); // For Wayward/Cairbre
                                        }
                                    }
                                }

                                if (mode === "both" || mode === "dark") {
                                    const darkIdx = soulPool.findIndex(c => c.dataset.name.includes('Blaster Dark'));
                                    if (darkIdx !== -1) {
                                        if (bCirc.querySelector('.card')) {
                                            alert("ช่องหลังไม่ว่าง! คอลไม่ได้");
                                        } else {
                                            const c = soulPool.splice(darkIdx, 1)[0];
                                            bCirc.appendChild(c);
                                            c.classList.remove('rest');
                                            applyStaticBonuses(c);
                                            sendMoveData(c);
                                            await checkOnPlaceAbilities(c, 'soul'); // For Wayward/Cairbre
                                        }
                                    }
                                }
                                updateSoulUI();
                                updateAllStaticBonuses();
                                alert(`Cordiela: การคอลเสร็จสิ้น! (${mode})`);
                            });
                        }
                    }
                }
            }
        }

        // --- Alpin Post-Battle Bind ---
        if (attacker.dataset.alpinBindReady === "true") {
            if (await vgConfirm("Alpin: Bind? (CC1/SC1)")) {
                attacker.classList.add('effect-retired');
                setTimeout(() => { attacker.remove(); }, 500);
                soulCharge(1); counterCharge(1);
                sendRemoveData(attacker);
            }
        }

        // --- Goildoat Post-Battle Retire ---
        if (attacker.dataset.goildoatRetireReady === "true") {
            if (confirm("Goildoat: [End of Battle] บังคับ Retire ตัวเองเพื่อจั่วการ์ด 1 ใบ?")) {
                const dropZone = document.querySelector('.my-side .drop-zone');
                dropZone.appendChild(attacker);
                attacker.classList.remove('rest');
                sendMoveData(attacker);
                alert("Goildoat: ถูกรีไทร์แล้ว! จั่วการ์ด 1 ใบ");
                drawCard(true);
                updateDropCount();
            }
        }

        // --- Magnolia G3 Post-Attack (VC) ---
        if (name.includes('magnolia') && attacker.parentElement.classList.contains('vc')) {
            if (isMyTurn && !attacker.dataset.magnoliaUsedInThisBattle) {
                attacker.dataset.magnoliaUsedInThisBattle = "true";
                if (await vgConfirm("Magnolia: [AUTO](VC) เมื่อจบการต่อสู้ [CB1] เพื่อเลือกยูนิทแถวหลังโจมตีและพลัง +5000?")) {
                    if (payCounterBlast(1)) {
                        const count = personaRideActive ? 3 : 1;
                        alert(`เลือกเรียร์การ์ด ${count} ใบ เพื่อให้โจมตีจากแถวหลังได้และพลัง +5000`);
                        for (let i = 0; i < count; i++) {
                            document.body.classList.add('targeting-mode');
                            await new Promise(resolve => {
                                const choiceListener = (e) => {
                                    const target = e.target.closest('.circle.rc .card:not(.opponent-card)');
                                    if (target) {
                                        e.stopPropagation();
                                        target.dataset.canAttackFromBack = "true";
                                        target.dataset.power = (parseInt(target.dataset.power) + 5000).toString();
                                        syncPowerDisplay(target);
                                        sendMoveData(target);
                                        alert(`ยูนิท ${target.dataset.name} สามารถโจมตีจากแถวหลังได้แล้ว!`);
                                        document.body.classList.remove('targeting-mode');
                                        document.removeEventListener('click', choiceListener, true);
                                        resolve();
                                    }
                                };
                                document.addEventListener('click', choiceListener, true);
                            });
                        }
                    }
                }
            }
        }

        // Resolve any remaining abilities in queue
        if (queue.length > 0) {
            await resolveAbilityQueue(queue);
        }

        // --- Baur Vairina Reset ---
        attacker.dataset.baurDriveCheck = "false";
        attacker.dataset.baurDriveUsed = "false";
        attacker.dataset.driveAdded = "0";

        if (attacker.dataset.baurPwrAdded && attacker.dataset.baurPwrAdded !== "0") {
            const pwrAdded = parseInt(attacker.dataset.baurPwrAdded);
            attacker.dataset.power = (parseInt(attacker.dataset.power) - pwrAdded).toString();
            attacker.dataset.baurPwrAdded = "0";
            if (attacker.dataset.emmelineAtkBonus) {
                attacker.dataset.power = (parseInt(attacker.dataset.power) - parseInt(attacker.dataset.emmelineAtkBonus)).toString();
                attacker.dataset.emmelineAtkBonus = "0";
            }
            syncPowerDisplay(attacker);
        }

        // --- Mirrors Vairina Reset ---
        if (attacker.dataset.mirrorsPowerAdded === "true") {
            attacker.dataset.power = (parseInt(attacker.dataset.power) - 10000).toString();
            attacker.dataset.mirrorsPowerAdded = "false";
            syncPowerDisplay(attacker);
        }

        // Reset temporary flags
        attacker.dataset.magnoliaUsedInThisBattle = "false";
        attacker.dataset.alpinBindReady = "false";
        attacker.dataset.goildoatRetireReady = "false";
        attacker.dataset.gabrestrict = "false";
        attacker.dataset.guardRestrictGrades = "";
        attacker.dataset.guardRestrictCount = "0";
    }

    function counterCharge(count) {
        const closedCards = Array.from(document.querySelectorAll('.my-side .damage-zone .card.face-down'));
        const toTurn = Math.min(count, closedCards.length);
        for (let i = 0; i < toTurn; i++) {
            closedCards[i].classList.remove('face-down');
            sendMoveData(closedCards[i]);
        }
        if (toTurn > 0) alert(`Counter Charge ${toTurn}!`);
    }


    function resolveRemoteAttack(data) {
        const attackData = data.attackData;
        console.log("Receiving Remote Attack Settlement:", attackData);

        if (attackData.isPG === true || attackData.isHit === false) {
            const reason = attackData.isPG ? "Perfect Guard" : "Power check";
            alert(`Attack blocked! (${reason}) Opponent's ${attackData.attackerName} (Power: ${attackData.totalPower}) did not hit your ${attackData.targetName}.`);
            return;
        }

        let targetId = attackData.targetId;
        if (targetId && targetId.startsWith('opp-')) {
            targetId = targetId.replace('opp-', '');
        }
        const targetElement = document.getElementById(targetId);
        let targetCard = null;
        if (targetElement) {
            targetCard = targetElement.classList.contains('circle') ? targetElement.querySelector('.card') : targetElement;
        }

        if (attackData.isTargetVanguard) {
            let totalDmg = parseInt(attackData.totalCritical || "1");
            alert(`You are taking ${totalDmg} damage! (${attackData.attackerName} hit your Vanguard)`);
            dealDamage(totalDmg);
        } else {
            if (targetCard) {
                alert(`Your ${attackData.targetName} was retired!`);
                triggerShake();

                // Retired animation before moving to drop
                targetCard.classList.add('effect-retired');

                setTimeout(() => {
                    const dropZone = document.querySelector('.my-side .drop-zone');
                    dropZone.appendChild(targetCard);
                    window.myRGRetiredThisTurn = true;
                    targetCard.classList.remove('effect-retired', 'rest');
                    targetCard.style.transform = `rotate(${Math.random() * 20 - 10}deg)`;
                    sendMoveData(targetCard);
                    updateDropCount();
                    updateAllStaticBonuses();
                }, 500);
            }
        }
        window.currentIncomingAttack = null;
    }

    function showGameOver(result) {
        if (result === 'Lose') {
            sendData({ type: 'gameOver' });
        }

        let overlay = document.getElementById('game-over-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'game-over-overlay';
            overlay.className = 'overlay glass-panel';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.flexDirection = 'column';
            overlay.style.zIndex = '10000';
            overlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
            document.body.appendChild(overlay);
        }

        overlay.innerHTML = `
            <h1 style="font-size: 4rem; color: ${result === 'Win' ? '#4ade80' : '#f87171'}; text-shadow: 0 0 20px ${result === 'Win' ? '#4ade80' : '#f87171'}; font-family: 'Orbitron', sans-serif; text-transform: uppercase;">You ${result}!</h1>
            <button id="return-lobby-btn" class="btn mt-4 glow-effect" style="margin-top: 30px; padding: 15px 40px; font-size: 1.5rem; font-family: 'Orbitron', sans-serif; cursor: pointer;">Return to Lobby</button>
        `;

        document.getElementById('return-lobby-btn').addEventListener('click', () => {
            if (peer) peer.destroy();
            window.location.href = 'lobby.html';
        });
    }

    function syncRemoteMove(data) {
        const oppSide = document.querySelector('.opponent-side');
        // Comprehensive mapping for mirroring
        const zoneMap = {
            'rc_front_left': 'rc_front_right',
            'rc_front_right': 'rc_front_left',
            'rc_back_left': 'rc_back_right',
            'rc_back_right': 'rc_back_left',
            'rc_back_center': 'rc_back_center',
            'vc': 'vc',
            'drop-zone': 'drop-zone',
            'damage-zone': 'damage-zone',
            'soul': 'soul',
            'hand': 'hand'
        };
        const mappedZone = zoneMap[data.zone] || data.zone;

        // Handle Soul move - just remove from field
        if (mappedZone === 'soul') {
            const cardId = data.cardId;
            const card = document.getElementById(cardId) || document.getElementById(`opp-${cardId}`);
            if (card) {
                card.classList.add('effect-retired');
                setTimeout(() => card.remove(), 500);
            }
            return;
        }

        // Determine the local player's version of the card ID
        let resolvedCardId = data.cardId;
        if (data.cardId.startsWith('opp-')) {
            // Sender is referring to our card by its opponent name. Strip prefix.
            resolvedCardId = data.cardId.replace(/^opp-/, '');
        } else if (data.cardId.startsWith('h-') || data.cardId.startsWith('g-')) {
            // Sender is referring to their own card. Add prefix.
            resolvedCardId = 'opp-' + data.cardId;
        }

        let targetZone;
        if (data.isImprisoned) {
             // Find if this card belongs to the local player
             const localOrig = document.getElementById(resolvedCardId);
             if (localOrig && !localOrig.classList.contains('opponent-card')) {
                  // This is OUR card being imprisoned by the opponent. Move to opponent side.
                  targetZone = oppSide.querySelector('.order-zone');
             } else {
                  // This is THEIR card moving to our prison (inmate).
                  targetZone = document.querySelector('.my-side .order-zone');
             }
        } else {
             targetZone = oppSide.querySelector(`[data-zone="${mappedZone}"]`) || 
                        oppSide.querySelector(`.circle.${mappedZone}`) ||
                        oppSide.querySelector(`.${mappedZone}`);
        }

        if (targetZone) {
            updateAllPrisonUI(); 
            
            // Check if the card is already on our side but not as an opponent card
            // Use the resolved ID to find it locally.
            const myCard = document.getElementById(resolvedCardId);

            // Strong Safety: Never let remote commands move our own Vanguard
            if (myCard && !myCard.classList.contains('opponent-card')) {
                const myInVC = myCard.parentElement?.classList.contains('vc');
                if (myInVC) {
                    console.warn("Blocked remote move attempt on local Vanguard:", resolvedCardId);
                    return;
                }

                // If it's another unit of ours being moved (retired), allow only to non-VC zones
                if (data.zone !== 'vc') {
                    if (data.isImprisoned) myCard.classList.add('imprisoned-card');
                    else myCard.classList.remove('imprisoned-card');
                    
                    targetZone.appendChild(myCard);
                }
                updateAllPrisonUI(); // Crucial: Update prison UI before returning
                return;
            }

            let card = document.getElementById(resolvedCardId);

            if (!card) {
                card = createCardElement({
                    name: data.cardName || data.name,
                    grade: data.grade,
                    power: data.power,
                    shield: data.shield,
                    critical: data.critical,
                    skill: data.skill,
                    imageUrl: data.imageUrl || data.imagePreview
                });
                card.id = resolvedCardId;
                card.classList.add('opponent-card');
                card.draggable = false;
            } else {
                // Check if power/crit needs updating (e.g. from triggers)
                let changed = false;
                if (card.dataset.power !== String(data.power)) {
                    card.dataset.power = data.power;
                    changed = true;
                }
                if (data.critical && card.dataset.critical !== String(data.critical)) {
                    card.dataset.critical = data.critical;
                    changed = true;
                }

                if (changed) {
                    const powerSpan = card.querySelector('.card-power');
                    if (powerSpan) {
                        let displayCritical = parseInt(card.dataset.critical) > 1 ? `<span style="color:gold;">★${card.dataset.critical}</span>` : '';
                        powerSpan.innerHTML = `⚔️${parseInt(card.dataset.power) >= 1000000 ? (parseInt(card.dataset.power) / 1000000).toFixed(1) + 'M' : card.dataset.power} ${displayCritical}`;
                    }
                }
            }

            // Handle Vanguard replacement or OverDress replacement clears circle first
            // Handle Vanguard replacement: ONLY clear if moving to VC AND IDs are different
            if (data.zone === 'vc') {
                targetZone.querySelectorAll('.card').forEach(c => {
                    if (c.id !== resolvedCardId) {
                        console.log("Replacing remote Vanguard:", c.id, "with", resolvedCardId);
                        c.remove();
                    }
                });
            } else if (targetZone.classList.contains('circle') && (data.isOD || data.isXOD)) {
                // OverDress replacement
                targetZone.querySelectorAll('.card').forEach(c => c.remove());
            }

            // Announcement of opponent actions
            if (mappedZone === 'vc') {
                alert(`คู่แข่งทำการ ไรด์ (Ride): ${data.cardName}!`);
            } else if (mappedZone.startsWith('rc') && !data.isImprisoned) {
                alert(`คู่แข่งทำการ คอล (Call): ${data.cardName}!`);
            } else if (mappedZone === 'order-zone' && !data.isImprisoned) {
                alert(`คู่แข่งทำการ เล่นออเดอร์ (Play Order): ${data.cardName}!`);
            }

            if (card.parentElement !== targetZone) {
                targetZone.appendChild(card);
            }

            // Handle visual orientation
            if (data.isRest) card.classList.add('rest');
            else card.classList.remove('rest');

            if (data.isFaceDown) card.classList.add('face-down');
            else card.classList.remove('face-down');

            if (data.isImprisoned) {
                card.classList.add('imprisoned-card');
            } else {
                card.classList.remove('imprisoned-card');
            }
            updateAllPrisonUI(); // Always update UI in case card moved into OR out of prison

            // Set OD / X-OD badges
            if (data.isOD || data.isXOD) {
                let badge = card.querySelector('.dress-badge');
                if (!badge) {
                    badge = document.createElement('div');
                    badge.className = 'dress-badge';
                    badge.style.position = 'absolute';
                    badge.style.bottom = '-8px';
                    badge.style.left = '50%';
                    badge.style.transform = 'translateX(-50%)';
                    badge.style.color = '#fff';
                    badge.style.padding = '2px 6px';
                    badge.style.borderRadius = '8px';
                    badge.style.fontSize = '0.65rem';
                    badge.style.fontWeight = 'bold';
                    badge.style.zIndex = '5';
                    badge.style.pointerEvents = 'none';
                    card.appendChild(badge);
                }
                badge.style.backgroundColor = data.isXOD ? '#e11d48' : '#9333ea';
                badge.textContent = data.isXOD ? 'X-OD' : 'OD';
            } else {
                const badge = card.querySelector('.dress-badge');
                if (badge) badge.remove();
            }

            updateDropCount();
        }
    }

    function initGame() {
        // Assign unique IDs to every card in the deck to prevent search bugs
        deckPool = currentDeck.mainDeck.map((c, i) => ({ 
            ...c, 
            id: `p-main-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}` 
        }));
        window.regalisPieceUsed = false;
        updateDeckCounter();
        const rideDeckZone = document.getElementById('ride-deck');
        const vanguardCircle = document.querySelector('.my-side .circle.vc');
        rideDeckZone.innerHTML = '<span class="zone-label">Ride Deck</span>';

        const starter = currentDeck.rideDeck.find(c => c.grade === 0);
        if (starter) {
            const starterCard = createCardElement(starter);
            vanguardCircle.appendChild(starterCard);
            sendMoveData(starterCard);
        }

        currentDeck.rideDeck.filter(c => c.grade > 0)
            .sort((a, b) => b.grade - a.grade)
            .forEach(c => rideDeckZone.appendChild(createCardElement(c)));

        // AI Mode Setup: Player and AI both need to participate in RPS
        startRPS();

        // Initialize prison zones if applicable
        setTimeout(() => initPrisonZones(), 500);
    }

    // --- URL Parameters Orchestration ---
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const role = urlParams.get('role');
    const friendId = urlParams.get('friendId');
    const deckChoice = urlParams.get('deck') || urlParams.get('playerDeck');
    const aiDeckChoice = urlParams.get('aiDeck');
    const difficultyChoice = urlParams.get('difficulty');
    const customId = urlParams.get('customId');

    if (mode === 'ai') {
        startAIGame(deckChoice, aiDeckChoice, difficultyChoice || 'hard');
    } else {
        if (deckChoice === 'bruce') currentDeck = bruceDeck;
        else if (deckChoice === 'magnolia') currentDeck = magnoliaDeck;
        else if (deckChoice === 'nirvana') currentDeck = nirvanaJhevaDeck;
        else if (deckChoice === 'majesty') currentDeck = majestyDeck;
        else if (deckChoice === 'avantgarda') currentDeck = avantgardaDeck;
        else if (deckChoice === 'youthberk') currentDeck = youthberkDeck;
        else if (deckChoice === 'overlord') currentDeck = overlordDeck;
        else if (deckChoice === 'greedon') currentDeck = greedonDeck;
        else if (deckChoice === 'seraph') currentDeck = seraphDeck;

        if (role === 'host') {
            initPeer(customId);
        } else if (role === 'guest' && friendId) {
            if (matchmakingSubtitle) matchmakingSubtitle.textContent = `Searching Arena: ${friendId}...`;
            initPeer();

            const checkReady = setInterval(() => {
                if (peer && peer.id) {
                    clearInterval(checkReady);
                    if (gameStatusText) gameStatusText.textContent = 'Connecting to Host...';

                    console.log("Guest connecting to:", friendId);
                    conn = peer.connect(friendId, { reliable: true });
                    isHost = false;
                    isFirstPlayer = false;
                    window.isFirstPlayer = false;

                    conn.on('open', () => {
                        console.log("Connected! Handshaking...");
                        if (gameStatusText) gameStatusText.textContent = 'Handshaking...';

                        const lobbyContent = document.querySelector('.lobby-content');
                        if (lobbyContent) lobbyContent.classList.add('effect-match-found');

                        // Small delay to ensure host is ready for data and play animation
                        setTimeout(() => {
                            sendData({ type: 'guestJoin' });
                            setupConnection();
                        }, 1000);
                    });

                    conn.on('error', (err) => {
                        console.error("Connection error:", err);
                        if (gameStatusText) gameStatusText.textContent = "Connection Failed. Retrying...";
                        setTimeout(() => window.location.reload(), 2000);
                    });
                }
            }, 800);
        }
    }

    async function executeBailoutMove(card) {
        if (!card) return;
        
        // Hide the viewer automatically to let player choose RC
        const zViewer = document.getElementById('zone-viewer');
        if (zViewer) zViewer.classList.add('hidden');
        
        alert(`เลือกช่อง (RC) เพื่อคอล ${card.dataset.name} ที่เตรียมประกันตัว`);
        document.body.classList.add('targeting-mode');
        
        // Trigger Muna [AUTO]
        document.querySelectorAll('.my-side .circle.rc .card').forEach(c => {
            if ((c.dataset.name || "").includes('Muna')) {
                triggerMunaSkill(c);
            }
        });
        
        await new Promise(resolve => {
            const callListener = async (ev) => {
                const targetCircle = ev.target.closest('.my-side .circle.rc');
                if (targetCircle) {
                    ev.stopPropagation();
                    const existing = targetCircle.querySelector('.card:not(.opponent-card)');
                    if (existing) {
                        const dropZone = document.querySelector('.my-side .drop-zone');
                        if (dropZone) {
                            dropZone.appendChild(existing);
                            existing.classList.remove('rest');
                            sendMoveData(existing);
                        }
                    }
                    targetCircle.appendChild(card);
                    card.classList.remove('imprisoned-card');
                    card.classList.remove('rest');
                    card.style.transform = 'none';
                    
                    sendMoveData(card, 'rc'); 
                    sendData({ type: 'checkUpdateSeraph' }); 
                    updateAllPrisonUI();
                    
                    document.body.classList.remove('targeting-mode');
                    document.removeEventListener('click', callListener, true);
                    
                    if (window.bailoutPendingCount > 0) window.bailoutPendingCount--;
                    
                    // If we have more cards to bailout (from CB1), reopen viewer if possible
                    if (window.bailoutPendingCount > 0 || (window.freeBailout && window.freeBailout > 0)) {
                         // Free bailout logic is handled differently, usually CB1 allows +1 more.
                         // For now, let's just finish the current one.
                    }
                    resolve();
                } else if (ev.target.closest('.close-btn') || ev.target.closest('#next-phase-btn')) {
                     document.body.classList.remove('targeting-mode');
                     document.removeEventListener('click', callListener, true);
                     resolve();
                }
            };
            document.addEventListener('click', callListener, true);
        });
    }

    function openViewer(title, cards) {
        if (!zoneViewer || !viewerTitle || !viewerGrid) return;
        
        // Hide prison actions by default
        const prisonActions = document.getElementById('prison-bailout-actions');
        if (prisonActions) prisonActions.classList.add('hidden');

        viewerTitle.textContent = title;
        viewerGrid.innerHTML = '';

        cards.forEach(originalCard => {
            let node;
            if (originalCard instanceof HTMLElement) {
                node = originalCard.cloneNode(true);
                node.dataset.originalId = originalCard.id;
                
                node.addEventListener('dragstart', (e) => {
                    draggedCard = node;
                    setTimeout(() => node.classList.add('dragging'), 0);
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', node.id);
                });
                node.addEventListener('dragend', () => {
                    if (draggedCard) draggedCard.classList.remove('dragging');
                    draggedCard = null;
                    if (typeof updateHandCount === 'function') updateHandCount();
                });
            } else {
                node = createCardElement(originalCard);
                if (originalCard.id) {
                    node.dataset.originalId = originalCard.id;
                }
            }

            node.classList.remove('dragging', 'rest', 'opponent-card');
            node.style.position = 'relative';
            node.style.transform = 'none';
            node.style.top = 'auto';
            node.style.left = 'auto';
            node.style.margin = '0';

            node.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const original = document.getElementById(node.dataset.originalId);
                if (original) openSkillViewer(original);
                else openSkillViewer(node);
            });

            node.addEventListener('click', (e) => {
                const titleLower = (viewerTitle.textContent || "").toLowerCase();
                
                // --- CUSTOM PRISON BAILOUT LOGIC ---
                if (document.body.classList.contains('targeting-mode') && titleLower.includes('prison')) {
                    e.stopPropagation();
                    const originalId = node.dataset.originalId;
                    const originalCard = document.getElementById(originalId);
                    if (originalCard && originalCard.classList.contains('imprisoned-card')) {
                        // Move this card back!
                        executeBailoutMove(originalCard);
                    }
                    return;
                }

                const selectionKeywords = ["select", "choose", "choice", "เลือก", "ค้นหา", "หา", "top", "ดู"];
                const isSelection = selectionKeywords.some(k => titleLower.includes(k));
                
                if (!isSelection && !document.body.classList.contains('targeting-mode')) {
                    // --- Tap to Select for Movement from Viewer ---
                    if (isMyMyTurn()) {
                        e.stopPropagation();
                        if (selectedCard) selectedCard.classList.remove('card-selected');
                        
                        if (selectedCard === node) {
                            selectedCard = null;
                        } else {
                            selectedCard = node;
                            node.classList.add('card-selected');
                        }
                        return;
                    }

                    e.stopPropagation();
                    const original = document.getElementById(node.dataset.originalId);
                    if (original) openSkillViewer(original);
                    else openSkillViewer(node);
                }
            });

            function isMyMyTurn() {
                return (typeof isMyTurn !== 'undefined' && isMyTurn);
            }

            viewerGrid.appendChild(node);
        });

        zoneViewer.classList.remove('hidden');
    }

    if (copyGameIdBtn) {
        copyGameIdBtn.addEventListener('click', () => {
            const id = gamePeerIdDisplay.textContent;
            // Create a full URL for easier joining
            const joinUrl = `${window.location.origin}${window.location.pathname.replace('index.html', 'lobby.html')}?id=${id}`;

            if (navigator.share) {
                navigator.share({
                    title: 'Join my Vanguard Match!',
                    text: `Enter my Arena with ID: ${id}`,
                    url: joinUrl
                }).catch(err => {
                    navigator.clipboard.writeText(joinUrl);
                    alert('Match Link Copied!');
                });
            } else {
                navigator.clipboard.writeText(joinUrl);
                alert('Match Link Copied!');
            }
        });
    }

    document.querySelectorAll('.zone, .circle.vc, .circle.rc, .guardian-circle, #player-hand').forEach(el => {
        // DRAG AND DROP
        el.addEventListener('dragover', (e) => {
            e.preventDefault();
            el.classList.add('zone-highlight');
        });

        el.addEventListener('dragleave', () => {
            el.classList.remove('zone-highlight');
        });

        el.addEventListener('drop', async (e) => {
            e.preventDefault();
            el.classList.remove('zone-highlight');
            if (draggedCard) {
                const isFromViewer = draggedCard.closest('#viewer-grid');
                if (isFromViewer) {
                    // Extract the original card reference
                    const originalId = draggedCard.dataset.originalId || draggedCard.id;
                    let actualDom = document.getElementById(originalId);

                    if (actualDom && actualDom.parentElement && actualDom.parentElement.id !== 'viewer-grid') {
                        // Original is in a DOM zone (Drop, Damage, Order, etc.)
                        const moved = await validateAndMoveCard(actualDom, el);
                        if (moved) draggedCard.remove();
                    } else {
                        // Original is in an array pool (Deck, Soul, Bind)
                        let cardObj = null;
                        
                        let idx = deckPool.findIndex(c => c.id === originalId);
                        if (idx !== -1) { 
                            cardObj = deckPool[idx]; 
                            const newDomElem = createCardElement(cardObj);
                            if (cardObj.id) newDomElem.id = cardObj.id; // preserve ID
                            if (await validateAndMoveCard(newDomElem, el)) {
                                deckPool.splice(idx, 1);
                                if (typeof updateDeckCounter === 'function') updateDeckCounter();
                                draggedCard.remove();
                            }
                        } else {
                            idx = soulPool.findIndex(c => c.id === originalId);
                            if (idx !== -1) { 
                                cardObj = soulPool[idx]; 
                                const newDomElem = createCardElement(cardObj);
                                if (cardObj.id) newDomElem.id = cardObj.id;
                                if (await validateAndMoveCard(newDomElem, el)) {
                                    soulPool.splice(idx, 1);
                                    if (typeof updateSoulUI === 'function') updateSoulUI();
                                    draggedCard.remove();
                                }
                            } else {
                                idx = bindPool.findIndex(c => c.id === originalId);
                                if (idx !== -1) {
                                    cardObj = bindPool[idx];
                                    const newDomElem = createCardElement(cardObj);
                                    if (cardObj.id) newDomElem.id = cardObj.id;
                                    if (await validateAndMoveCard(newDomElem, el)) {
                                        bindPool.splice(idx, 1);
                                        draggedCard.remove();
                                    }
                                } else {
                                    // Fallback: move the clone if no match found
                                    await validateAndMoveCard(draggedCard, el);
                                }
                            }
                        }
                    }
                } else {
                    await validateAndMoveCard(draggedCard, el);
                }
                draggedCard = null;
            }
        });

        el.addEventListener('click', async (e) => {
            // TAP TO MOVE EXECUTION
            if (selectedCard) {
                const isFromViewer = selectedCard.closest('#viewer-grid');
                if (isFromViewer) {
                    const originalId = selectedCard.dataset.originalId || selectedCard.id;
                    let actualDom = document.getElementById(originalId);

                    if (actualDom && actualDom.parentElement && actualDom.parentElement.id !== 'viewer-grid') {
                        const moved = await validateAndMoveCard(actualDom, el);
                        if (moved) {
                            selectedCard.remove();
                            selectedCard = null;
                            return;
                        }
                    } else {
                        let cardObj = null;
                        let moved = false;
                        
                        let idx = deckPool.findIndex(c => c.id === originalId);
                        if (idx !== -1) { 
                            cardObj = deckPool[idx]; 
                            const newDomElem = createCardElement(cardObj);
                            if (cardObj.id) newDomElem.id = cardObj.id; // preserve ID
                            if (await validateAndMoveCard(newDomElem, el)) {
                                deckPool.splice(idx, 1);
                                if (typeof updateDeckCounter === 'function') updateDeckCounter();
                                moved = true;
                            }
                        } else {
                            idx = soulPool.findIndex(c => c.id === originalId);
                            if (idx !== -1) { 
                                cardObj = soulPool[idx]; 
                                const newDomElem = createCardElement(cardObj);
                                if (cardObj.id) newDomElem.id = cardObj.id;
                                if (await validateAndMoveCard(newDomElem, el)) {
                                    soulPool.splice(idx, 1);
                                    if (typeof updateSoulUI === 'function') updateSoulUI();
                                    moved = true;
                                }
                            } else {
                                idx = bindPool.findIndex(c => c.id === originalId);
                                if (idx !== -1) {
                                    cardObj = bindPool[idx];
                                    const newDomElem = createCardElement(cardObj);
                                    if (cardObj.id) newDomElem.id = cardObj.id;
                                    if (await validateAndMoveCard(newDomElem, el)) {
                                        bindPool.splice(idx, 1);
                                        moved = true;
                                    }
                                } else {
                                    moved = await validateAndMoveCard(selectedCard, el);
                                }
                            }
                        }
                        
                        if (moved) {
                            selectedCard.remove();
                            selectedCard = null;
                            return;
                        }
                    }
                } else {
                    const moved = await validateAndMoveCard(selectedCard, el);
                    if (moved) {
                        selectedCard.classList.remove('card-selected');
                        selectedCard = null;
                        return;
                    }
                }
            }

            // PRE-EXISTING CLICK LOGIC (Viewers, etc)
            // Target checks
            const isBadge = e.target.classList.contains('soul-badge');
            const isCard = e.target.classList.contains('card') || e.target.closest('.card');
            const isCircleBody = e.target === el || e.target.classList.contains('glow-ring') || e.target.classList.contains('circle-label');

            if (el.classList.contains('vc') && !isCard) {
                const isOpponentSide = el.closest('.opponent-side');
                if (isOpponentSide) {
                    const badge = el.querySelector('.soul-badge');
                    alert(`Opponent's Soul count: ${badge ? badge.textContent.split(': ')[1] : '0'}`);
                } else {
                    handleSoulView(e);
                }
                return;
            }

            // Damage/Drop viewing logic
            const zoneType = el.dataset.zone;
            if (zoneType === 'damage' || zoneType === 'drop') {
                if (!isCard) {
                    const isOpponentSide = el.closest('.opponent-side');
                    const sidePrefix = isOpponentSide ? 'Opponent ' : 'Your ';
                    const cards = el.querySelectorAll('.card');
                    openViewer(`${sidePrefix}${zoneType.charAt(0).toUpperCase() + zoneType.slice(1)} Zone (${cards.length})`, Array.from(cards));
                }
            }
        });
    });

    function updateStatusUI() {
        const myBadge = document.getElementById('bruce-status-badge');
        const oppBadge = document.getElementById('opp-bruce-status-badge');

        // Update My Status
        if (myBadge) {
            if (isFinalRush) {
                myBadge.classList.remove('hidden');
                myBadge.textContent = isFinalBurst ? "Final Burst" : "Final Rush";
                if (isFinalBurst) myBadge.classList.add('burst-status');
                else myBadge.classList.remove('burst-status');
            } else {
                myBadge.classList.add('hidden');
            }
        }

        // Update Opponent Status
        if (oppBadge) {
            if (isOpponentFinalRush) {
                oppBadge.classList.remove('hidden');
                oppBadge.textContent = isOpponentFinalBurst ? "Rival Burst" : "Rival Rush";
                if (isOpponentFinalBurst) oppBadge.classList.add('burst-status');
                else oppBadge.classList.remove('burst-status');
            } else {
                oppBadge.classList.add('hidden');
            }
        }
    }

    // inlet pulse logic moved up
    function checkBruceBattleAbility() {
        if (!isMyTurn) return;
        const vanguard = document.querySelector('.my-side .circle.vc .card');
        if (!vanguard) {
            console.log("Bruce Ability: No Vanguard found.");
            return;
        }

        const name = (vanguard.dataset.name || "").toLowerCase();
        const isBruce = name.includes('bruce');
        const isViamance = name.includes('viamance');

        console.log(`Bruce Ability Check: Name="${name}", isBruce=${isBruce}, isViamance=${isViamance}`);

        if (!isBruce && !isViamance) return;

        // Check if all units on field are "Diabolos"
        // Get all cards on player's circles
        const myUnits = document.querySelectorAll('.my-side .circle .card:not(.opponent-card)');
        console.log(`Bruce Ability Check: Found ${myUnits.length} units.`);

        if (myUnits.length === 0) return;

        const allDiabolos = Array.from(myUnits).every(u => {
            const uName = (u.dataset.name || "").toLowerCase();
            const hasDiabolos = uName.includes('diabolos');
            if (!hasDiabolos) console.log("Ability blocked by non-Diabolos unit:", uName);
            return hasDiabolos;
        });

        console.log(`Bruce Ability Check: allDiabolos=${allDiabolos}`);

        if (allDiabolos) {
            isFinalRush = true;
            finalRushTurnLimit = currentTurn + 1; // Until end of opponent's next turn

            const oppVanguard = document.querySelector('.opponent-side .circle.vc .card');
            const oppGrade = oppVanguard ? parseInt(oppVanguard.dataset.grade || "0") : 0;

            if (oppGrade >= 3) {
                isFinalBurst = true;
                alert("DIABOLOS: Entering FINAL BURST state!");
            } else {
                isFinalBurst = false;
                alert("DIABOLOS: Entering FINAL RUSH state!");
            }
            updateStatusUI();
            // Apply power bonuses to all units on field
            updateFinalRushStaticBonuses(true);
            sendData({ type: 'bruceStatus', isFinalRush, isFinalBurst, isPersona: isFinalBurst });
        } else {
            // Optional: Alert the user why it failed if they expected it
            console.log("Diabolos Ability: Requirements not met (All units must be Diabolos).");
        }
    }

    // Event Listeners for Viewer
    // View Order Zone function
    window.viewOrderZone = (side) => {
        const selector = side === 'my' ? '.my-side .order-zone' : '.opponent-side .order-zone';
        const zone = document.querySelector(selector);
        if (!zone) return;
        const cards = Array.from(zone.querySelectorAll('.card'));
        if (cards.length === 0) {
            alert(`Order Zone (${side === 'my' ? 'Mine' : "Opponent's"}) is empty.`);
            return;
        }
        openViewer(`${side === 'my' ? 'My' : "Opponent's"} Order Zone`, cards);
    };

    async function checkRevolDressOnPlace(card) {
        const name = card.dataset.name;
        const queue = [];

        // 1. Tempest Skill
        if (name.includes('Tempest')) {
            queue.push({
                name: 'RevolForm: Tempest Skill',
                description: 'แถวหน้าพลัง +5000 / [CB1] ดู 2 ใบ รีไทร์คู่แข่งและจั่ว',
                resolve: async (done) => {
                    alert("Youthberk \"RevolForm: Tempest\": [AUTO] เมื่อวางโดย RevolDress แถวหน้าทั้งหมดพลัง +5000!");
                    document.querySelectorAll('.my-side .circle .card:not(.opponent-card)').forEach(u => {
                        const z = u.parentElement.dataset.zone || "";
                        if (z === 'vc' || z === 'rc_front_left' || z === 'rc_front_right') {
                            u.dataset.power = parseInt(u.dataset.power) + 5000;
                            syncPowerDisplay(u);
                            sendMoveData(u);
                        }
                    });

                    if (await vgConfirm("Tempest: [CB1] เพื่อเปิดใบบนสุด 2 ใบ เลือกเรียร์การ์ดคู่แข่ง 1 ใบที่เกรดตรงกับ 1 ในนั้น และนำทั้ง 2 ใบขึ้นมือ?")) {
                        if (payCounterBlast(1)) {
                            if (deckPool.length < 2) alert("การ์ดในกองไม่พอ!");
                            const revealed = deckPool.splice(0, Math.min(2, deckPool.length));
                            updateDeckCounter();

                            if (revealed.length > 0) {
                                const revealedGrades = revealed.map(c => parseInt(c.grade));
                                openViewer("เปิดการ์ด 2 ใบ (ปิดหน้าต่างนี้เพื่อไปต่อ)", revealed);
                                await new Promise(res => {
                                    const handler = () => {
                                        zoneViewer.classList.add('hidden');
                                        closeViewerBtn.removeEventListener('click', handler);
                                        res();
                                    };
                                    closeViewerBtn.addEventListener('click', handler);
                                });

                                const oppRGs = Array.from(document.querySelectorAll('.opponent-side .circle.rc .card'));
                                const validRGs = oppRGs.filter(c => revealedGrades.includes(parseInt(c.dataset.grade || "0")));

                                if (validRGs.length > 0) {
                                    if (await vgConfirm(`พบเป้าหมาย ${validRGs.length} ใบ ต้องการเลือกนำกลับเข้ากองหรือไม่?`)) {
                                        alert("คลิกเป้าหมายเพื่อนำกลับเข้าใต้กอง");
                                        document.body.classList.add('targeting-mode');
                                        await new Promise(res => {
                                            const sel = (e) => {
                                                const tgt = e.target.closest('.opponent-side .circle.rc .card');
                                                if (tgt && revealedGrades.includes(parseInt(tgt.dataset.grade || "0"))) {
                                                    e.stopPropagation();
                                                    document.body.classList.remove('targeting-mode');
                                                    document.removeEventListener('click', sel, true);
                                                    const rawId = tgt.id.replace('opp-', '');
                                                    sendData({ type: 'forcePutBottom', cardId: rawId });
                                                    tgt.remove();
                                                    alert("นำยูนิทคู่แข่งกลับเข้ากองแล้ว!");
                                                    res();
                                                }
                                            };
                                            document.addEventListener('click', sel, true);
                                        });
                                    }
                                }
                                revealed.forEach(cData => {
                                    const cElem = createCardElement(cData);
                                    playerHand.appendChild(cElem);
                                    sendMoveData(cElem);
                                });
                                updateHandSpacing();
                                updateHandCount();
                            }
                        }
                    }
                    if (done) done();
                }
            });
        }

        // 2. Gust Skill
        if (name.includes('Gust')) {
            queue.push({
                name: 'RevolForm: Gust Skill',
                description: '[ทิ้ง 1 ใบ] พลัง +10000 / Drive +1 (แวนคู่แข่ง G3+)',
                resolve: async (done) => {
                    card.dataset.power = (parseInt(card.dataset.power) + 10000).toString();
                    syncPowerDisplay(card);
                    alert("Youthberk \"RevolForm: Gust\": พลัง +10000!");

                    const oppVG = document.querySelector('.opponent-side .circle.vc .card');
                    if (oppVG && parseInt(oppVG.dataset.grade || "0") >= 3) {
                        if (await vgConfirm("Gust: แวนการ์ดคู่แข่งเกรด 3+ จ่าย [ทิ้งมือ 1 ใบ] เพื่อรับ Drive +1?")) {
                            if (await payDiscard(1)) {
                                card.dataset.drive = (parseInt(card.dataset.drive || "2") + 1).toString();
                                alert("Gust: ได้รับ Drive +1 สำเร็จ!");
                                sendMoveData(card);
                            }
                        }
                    }
                    if (done) done();
                }
            });
        }

        // 3. Sequana Skill
        const sequanas = document.querySelectorAll('.my-side .circle.rc .card:not(.opponent-card)');
        sequanas.forEach(seq => {
            if (seq.dataset.name && seq.dataset.name.includes('Sequana')) {
                queue.push({
                    name: `Witch of Accumulation, Sequana: ${seq.id}`,
                    description: '[นำเข้าโซล] ปรับแวนการ์ดให้มี 1 ไดรฟ์ (ใช้เพื่อปรับลำดับการเพิ่มไดรฟ์ของ Gust)',
                    resolve: async (done) => {
                        if (await vgConfirm(`ใช้สกิล Sequana (${seq.id}): [COST][นำยูนิทนี้เข้าโซล] ปรับแวนการ์ดไดรฟ์เป็น 1?`)) {
                            soulPool.push(seq);
                            seq.remove();
                            updateSoulUI();
                            card.dataset.drive = "1";
                            sendMoveData(card);
                            alert("Sequana: ปรับแวนการ์ดไดรฟ์เป็น 1 สำเร็จ!");
                        }
                        if (done) done();
                    }
                });
            }
        });

        // 4. Dolbraig Skills
        const frontRowDolbraigs = Array.from(document.querySelectorAll('.my-side .circle.rc .card:not(.opponent-card)'))
            .filter(d => d.dataset.name && d.dataset.name.includes('Dolbraig'));

        frontRowDolbraigs.forEach(dolb => {
            const z = dolb.parentElement?.dataset.zone || "";
            if (z === 'rc_front_left' || z === 'rc_front_right') {
                queue.push({
                    name: `Knight of Plowing, Dolbraig: ${dolb.id}`,
                    description: 'เมื่อแวนถูกวางโดย RevolDress, แวนการ์ดพลัง +5000',
                    resolve: async (done) => {
                        alert(`Dolbraig: แวนการ์ดถูกวางโดย RevolDress! VG พลัง +5000!`);
                        card.dataset.power = (parseInt(card.dataset.power) + 5000).toString();
                        card.dataset.turnEndBuffPower = (parseInt(card.dataset.turnEndBuffPower || "0") + 5000).toString();
                        card.dataset.turnEndBuffActive = "true";
                        syncPowerDisplay(card);
                        sendMoveData(card);
                        if (done) done();
                    }
                });
            }
        });

        if (queue.length > 0) {
            await resolveAbilityQueue(queue);
        }
        updatePhaseUI(true);
    }

    if (closeViewerBtn) {
        closeViewerBtn.addEventListener('click', () => zoneViewer.classList.add('hidden'));
    }

    // Click-to-Ride Drop Zone Listener
    const playerDropZone = document.querySelector('.my-side .drop-zone');
    if (playerDropZone) {
        playerDropZone.addEventListener('click', () => {
            const selected = document.querySelector('.player-hand .card.selected-for-ride');
            if (selected && phases[currentPhaseIndex] === 'ride' && isMyTurn) {
                // Trigger the move logic which handles Ride from Ride Deck
                validateAndMoveCard(selected, playerDropZone);
                selected.classList.remove('selected-for-ride');
            }
        });
    }

    function initPowerObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && (mutation.attributeName === 'data-power' || mutation.attributeName === 'data-critical')) {
                    if (mutation.attributeName === 'data-power') {
                        const newValue = parseInt(mutation.target.dataset.power || "0");
                        const oldValue = parseInt(mutation.oldValue || "0");
                        const diff = newValue - oldValue;
                        if (diff !== 0 && mutation.target.offsetParent !== null) {
                            showPowerPopup(mutation.target, diff, 'power');
                        }
                    } else if (mutation.attributeName === 'data-critical') {
                        const newValue = parseInt(mutation.target.dataset.critical || "1");
                        const oldValue = parseInt(mutation.oldValue || "1");
                        const diff = newValue - oldValue;
                        if (diff !== 0 && mutation.target.offsetParent !== null) {
                            showPowerPopup(mutation.target, diff, 'critical');
                        }
                    }
                }
            });
        });

        const config = { attributes: true, attributeOldValue: true, subtree: true };
        const mySide = document.querySelector('.my-side');
        const oppSide = document.querySelector('.opponent-side');
        if (mySide) observer.observe(mySide, config);
        if (oppSide) observer.observe(oppSide, config);
    }

    function showPowerPopup(element, amount, type = 'power') {
        if (!element) return;
        const popup = document.createElement('div');
        const isCritical = (type === 'critical' || type === 'current-crit');

        popup.className = 'power-popup' + (amount < 0 ? ' negative' : '') + (isCritical ? ' critical' : '');

        let prefix = (amount > 0 ? '+' : '');
        if (type === 'current-crit') prefix = '';
        let label = isCritical ? ' CRIT' : '';
        popup.textContent = prefix + amount + label;

        const rect = element.getBoundingClientRect();
        popup.style.left = (rect.left + rect.width / 2) + 'px';
        popup.style.top = (rect.top + rect.height / 2) + 'px';
        popup.style.transform = 'translate(-50%, -50%)';

        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 4000);
    }
});