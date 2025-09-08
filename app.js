// Global variables
let currentUser = null;
let students = [];
let candidates = [];
let votes = [];
let votingLog = [];
let authorizedVoters = [];
let currentPage = 'landing';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    setupEventListeners();
    showPage('landingPage');
    startRealTimeUpdates();
});

// Initialize sample data
function initializeData() {
    // Load authorized voters
   // Load authorized voters (1NC22CS128 to 1NC22CS191)
authorizedVoters = [
    "1NC22CS128", "1NC22CS129", "1NC22CS130", "1NC22CS131", "1NC22CS132", "1NC22CS133", "1NC22CS134", "1NC22CS135",
    "1NC22CS136", "1NC22CS137", "1NC22CS138", "1NC22CS139", "1NC22CS140", "1NC22CS141", "1NC22CS142", "1NC22CS143",
    "1NC22CS144", "1NC22CS145", "1NC22CS146", "1NC22CS147", "1NC22CS148", "1NC22CS149", "1NC22CS150", "1NC22CS151",
    "1NC22CS152", "1NC22CS153", "1NC22CS154", "1NC22CS155", "1NC22CS156", "1NC22CS157", "1NC22CS158", "1NC22CS159",
    "1NC22CS160", "1NC22CS161", "1NC22CS162", "1NC22CS163", "1NC22CS164", "1NC22CS165", "1NC22CS166", "1NC22CS167",
    "1NC22CS168", "1NC22CS169", "1NC22CS170", "1NC22CS171", "1NC22CS172", "1NC22CS173", "1NC22CS174", "1NC22CS175",
    "1NC22CS176", "1NC22CS177", "1NC22CS178", "1NC22CS179", "1NC22CS180", "1NC22CS181", "1NC22CS182", "1NC22CS183",
    "1NC22CS184", "1NC22CS185", "1NC22CS186", "1NC22CS187", "1NC22CS188", "1NC22CS189", "1NC22CS190", "1NC22CS191"
];


    // Load sample students
    students = [
    // admin account
    {"id": "admin@123", "name": "Admin", "email": "admin@clg.edu", "class": "ADMIN", "department": "Administration", "hasVoted": false, "password": "crelection", "isAdmin": true},
    // all authorized voters
    ...authorizedVoters.map(usn => ({
        id: usn,
        name: usn, // default, can be customized
        email: `${usn.toLowerCase()}@clg.edu`, // example format
        class: "CS",
        department: "Computer Science",
        hasVoted: false,
        password: "password@123",
        voteTimestamp: null
    }))
];


    // Load sample candidates
    candidates = [
        {"id": 1, "name": "TEJAS", "class": "CS", "position": "Class Representative", "photo": "https://via.placeholder.com/150", "description": "Dedicated student leader with 2 years experience in student council", "voteCount": 8},
        {"id": 2, "name": "DADDY", "class": "CS", "position": "Class Representative", "photo": "https://via.placeholder.com/150", "description": "Passionate about student rights and academic excellence", "voteCount": 5},
        {"id": 3, "name": "SUHAS", "class": "CS", "position": "Class Representative", "photo": "https://via.placeholder.com/150", "description": "Experienced in organizing events and student activities", "voteCount": 7},
        {"id": 4, "name": "SANGA", "class": "EE", "position": "Class Representative", "photo": "https://via.placeholder.com/150", "description": "Engineering student focused on improving lab facilities", "voteCount": 4}
    ];

    // Load sample voting log
    votingLog = [
        
    ];
}

// Setup event listeners
function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Add candidate form
    const addCandidateForm = document.getElementById('addCandidateForm');
    if (addCandidateForm) {
        addCandidateForm.addEventListener('submit', handleAddCandidate);
    }

    // Add voter form
    const addVoterForm = document.getElementById('addVoterForm');
    if (addVoterForm) {
        addVoterForm.addEventListener('submit', handleAddVoter);
    }
}

// Page navigation functions
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Show/hide navbar based on page
    const navbar = document.getElementById('navbar');
    if (pageId === 'landingPage' || pageId === 'loginPage') {
        navbar.classList.add('hidden');
    } else {
        navbar.classList.remove('hidden');
    }
    
    currentPage = pageId;
}

// Navigation functions - made global for onclick access
window.showLanding = function() {
    showPage('landingPage');
}

window.showLogin = function() {
    showPage('loginPage');
}

window.showDashboard = function() {
    if (!currentUser) {
        showLogin();
        return;
    }
    updateDashboard();
    showPage('dashboardPage');
}

window.showVoting = function() {
    if (!currentUser) {
        showLogin();
        return;
    }
    if (currentUser.hasVoted) {
        showNotification('You have already voted!', 'warning');
        return;
    }
    updateVotingPage();
    showPage('votingPage');
}

window.showAdmin = function() {
    if (!currentUser || !currentUser.isAdmin) {
        showNotification('Access denied. Admin privileges required.', 'error');
        return;
    }
    updateAdminPage();
    showPage('adminPage');
}

window.logout = function() {
    currentUser = null;
    selectedVotes = {};
    updateNavigation();
    showLanding();
    showNotification('Logged out successfully', 'success');
}

// Authentication functions
function handleLogin(e) {
    e.preventDefault();
    const studentId = document.getElementById('loginId').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    // Admin login check for 'admin@123' with password 'crelection'
    if (studentId === 'admin@123') {
        if (password === 'crelection') {
            currentUser = students.find(s => s.id === 'admin@123');
            updateNavigation();
            showDashboard();
            showNotification('Admin login successful!', 'success');
        } else {
            showNotification('Invalid admin password', 'error');
        }
        return; // Stop further execution for admin login
    }

    // Student login for authorized voters
    if (!authorizedVoters.includes(studentId)) {
        showNotification('ID not authorized to vote', 'error');
        return;
    }

    const student = students.find(s => s.id === studentId && s.password === password);
    if (student) {
        currentUser = student;
        updateNavigation();
        showDashboard();
        showNotification('Login successful!', 'success');
    } else {
        showNotification('Invalid student ID or password', 'error');
    }
}


function updateNavigation() {
    const adminBtn = document.getElementById('adminBtn');
    if (currentUser && currentUser.isAdmin) {
        adminBtn.classList.remove('hidden');
    } else {
        adminBtn.classList.add('hidden');
    }
}

// Dashboard functions
function updateDashboard() {
    if (!currentUser) return;
    
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userClass').textContent = currentUser.class;
    document.getElementById('userDepartment').textContent = currentUser.department;
    
    // Update voting status
    const votingStatus = document.getElementById('votingStatus');
    const votingStatusText = document.getElementById('votingStatusText');
    const voteButton = document.getElementById('voteButton');
    const votingTimestamp = document.getElementById('votingTimestamp');
    
    if (currentUser.hasVoted) {
        votingStatus.innerHTML = '<span class="status status--success">Voted</span>';
        votingStatusText.textContent = 'Thank you for participating in the election!';
        voteButton.textContent = 'Vote Submitted';
        voteButton.disabled = true;
        voteButton.classList.remove('btn--primary');
        voteButton.classList.add('btn--outline');
        
        if (currentUser.voteTimestamp) {
            const timestamp = new Date(currentUser.voteTimestamp);
            votingTimestamp.querySelector('span').textContent = formatTimestamp(timestamp);
            votingTimestamp.classList.remove('hidden');
        }
    } else {
        votingStatus.innerHTML = '<span class="status status--warning">Not Voted</span>';
        votingStatusText.textContent = 'You haven\'t cast your vote yet. Click below to vote!';
        voteButton.textContent = 'Cast Your Vote';
        voteButton.disabled = false;
        voteButton.classList.remove('btn--outline');
        voteButton.classList.add('btn--primary');
        votingTimestamp.classList.add('hidden');
    }
}

// Voting functions
function updateVotingPage() {
    if (!currentUser) return;
    
    const votingPositions = document.getElementById('votingPositions');
    const positions = ['Class Representative', 'Vice Representative', 'Secretary', 'Treasurer'];
    
    votingPositions.innerHTML = '';
    
    positions.forEach(position => {
        const positionCandidates = candidates.filter(c => c.position === position);
        
        if (positionCandidates.length > 0) {
            const positionSection = document.createElement('div');
            positionSection.className = 'position-section';
            positionSection.innerHTML = `
                <h3 class="position-title">${position}</h3>
                <div class="candidates-grid" data-position="${position}">
                    ${positionCandidates.map(candidate => `
                        <div class="candidate-card" data-candidate-id="${candidate.id}" tabindex="0">
                            <div class="candidate-info">
                                <img src="${candidate.photo}" alt="${candidate.name}" class="candidate-photo">
                                <div class="candidate-details">
                                    <h4>${candidate.name}</h4>
                                    <p>${candidate.class} - ${candidate.position}</p>
                                </div>
                            </div>
                            <p class="candidate-description">${candidate.description}</p>
                        </div>
                    `).join('')}
                </div>
            `;
            votingPositions.appendChild(positionSection);
            
            // Add event listeners to candidate cards
            const candidateCards = positionSection.querySelectorAll('.candidate-card');
            candidateCards.forEach(card => {
                card.addEventListener('click', function() {
                    selectCandidate(parseInt(this.dataset.candidateId), position);
                });
                
                card.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        selectCandidate(parseInt(this.dataset.candidateId), position);
                    }
                });
            });
        }
    });
    
    // Reset selected votes when updating voting page
    selectedVotes = {};
    updateSubmitButton();
}

let selectedVotes = {};

window.selectCandidate = function(candidateId, position) {
    // Deselect previous selection for this position
    document.querySelectorAll(`[data-position="${position}"] .candidate-card`).forEach(card => {
        card.classList.remove('selected');
    });
    
    // Select new candidate
    const candidateCard = document.querySelector(`[data-candidate-id="${candidateId}"]`);
    if (candidateCard) {
        candidateCard.classList.add('selected');
    }
    
    // Store selection
    selectedVotes[position] = candidateId;
    
    // Update submit button
    updateSubmitButton();
}

function updateSubmitButton() {
    const submitBtn = document.getElementById('submitVoteBtn');
    if (!submitBtn) return;
    
    const selectedCount = Object.keys(selectedVotes).length;
    
    if (selectedCount > 0) {
        submitBtn.textContent = `Submit ${selectedCount} Vote${selectedCount > 1 ? 's' : ''}`;
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn--outline');
        submitBtn.classList.add('btn--primary');
    } else {
        submitBtn.textContent = 'Submit Vote';
        submitBtn.disabled = true;
        submitBtn.classList.remove('btn--primary');
        submitBtn.classList.add('btn--outline');
    }
}

window.submitVotes = function() {
    if (Object.keys(selectedVotes).length === 0) {
        showNotification('Please select at least one candidate', 'warning');
        return;
    }
    
    const voteTimestamp = new Date().toISOString();
    
    // Update vote counts and create voting log entries
    Object.values(selectedVotes).forEach(candidateId => {
        const candidate = candidates.find(c => c.id === candidateId);
        if (candidate) {
            candidate.voteCount++;
            
            // Add to voting log
            votingLog.push({
                voterId: currentUser.id,
                voterName: currentUser.name,
                candidateId: candidateId,
                candidateName: candidate.name,
                position: candidate.position,
                timestamp: voteTimestamp
            });
        }
    });
    
    // Mark user as voted
    currentUser.hasVoted = true;
    currentUser.voteTimestamp = voteTimestamp;
    const studentIndex = students.findIndex(s => s.id === currentUser.id);
    if (studentIndex !== -1) {
        students[studentIndex].hasVoted = true;
        students[studentIndex].voteTimestamp = voteTimestamp;
    }
    
    // Clear selections
    selectedVotes = {};
    
    showNotification('Vote submitted successfully!', 'success');
    showDashboard();
}

// Admin functions
function updateAdminPage() {
    showAdminTab('voters');
    updateVotersList();
    updateCandidatesList();
    updateLiveResults();
    updateActivityLog();
}

window.showAdminTab = function(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const targetTab = document.querySelector(`[onclick*="${tabName}"]`);
    if (targetTab) targetTab.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    const targetContent = document.getElementById(`admin${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);
    if (targetContent) targetContent.classList.add('active');
    
    // Load specific content
    if (tabName === 'results') {
        setTimeout(updateLiveResults, 100);
    } else if (tabName === 'activity') {
        updateActivityLog();
    }
}

// Voter management functions
function updateVotersList() {
    const votersList = document.getElementById('votersList');
    const totalAuthorized = document.getElementById('totalAuthorized');
    const totalVoted = document.getElementById('totalVoted');
    const totalPending = document.getElementById('totalPending');
    
    if (!votersList) return;
    
    // Update statistics
    const votedCount = authorizedVoters.filter(id => {
        const student = students.find(s => s.id === id);
        return student && student.hasVoted;
    }).length;
    
    totalAuthorized.textContent = authorizedVoters.length;
    totalVoted.textContent = votedCount;
    totalPending.textContent = authorizedVoters.length - votedCount;
    
    // Update voters list
    votersList.innerHTML = authorizedVoters.map(voterId => {
        const student = students.find(s => s.id === voterId);
        const hasVoted = student && student.hasVoted;
        const voteTime = student && student.voteTimestamp ? formatTimestamp(new Date(student.voteTimestamp)) : 'Not voted';
        
        return `
            <div class="voter-item">
                <div class="voter-info">
                    <h4>${voterId}</h4>
                    <p>${student ? `${student.name} - ${student.class}` : 'Student not registered'}</p>
                    <p>Status: ${hasVoted ? `Voted on ${voteTime}` : 'Not voted'}</p>
                </div>
                <div class="voter-actions">
                    <span class="status ${hasVoted ? 'status--success' : 'status--warning'}">
                        ${hasVoted ? 'Voted' : 'Pending'}
                    </span>
                    <button class="btn btn--outline btn--sm" onclick="removeVoterById('${voterId}')">Remove</button>
                </div>
            </div>
        `;
    }).join('');
}

function updateCandidatesList() {
    const candidatesList = document.getElementById('candidatesList');
    if (!candidatesList) return;
    
    candidatesList.innerHTML = candidates.map(candidate => `
        <div class="candidate-admin-item">
            <div class="candidate-admin-info">
                <img src="${candidate.photo}" alt="${candidate.name}">
                <div>
                    <h4>${candidate.name}</h4>
                    <p>${candidate.class} - ${candidate.position}</p>
                    <p>Votes: ${candidate.voteCount}</p>
                </div>
            </div>
            <div class="admin-actions">
                <button class="btn btn--outline btn--sm" onclick="editCandidate(${candidate.id})">Edit</button>
                <button class="btn btn--outline btn--sm" onclick="deleteCandidate(${candidate.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Live results functions
function updateLiveResults() {
    const liveResultsContent = document.getElementById('liveResultsContent');
    const positions = ['Class Representative', 'Vice Representative', 'Secretary', 'Treasurer'];
    
    if (!liveResultsContent) return;
    
    liveResultsContent.innerHTML = '';
    
    positions.forEach(position => {
        const positionCandidates = candidates.filter(c => c.position === position);
        
        if (positionCandidates.length > 0) {
            const totalVotes = positionCandidates.reduce((sum, c) => sum + c.voteCount, 0);
            
            const positionResults = document.createElement('div');
            positionResults.className = 'position-results';
            
            // Sort candidates by vote count
            const sortedCandidates = [...positionCandidates].sort((a, b) => b.voteCount - a.voteCount);
            
            positionResults.innerHTML = `
                <h3>${position}</h3>
                <div class="results-grid">
                    <div class="candidate-results">
                        ${sortedCandidates.map(candidate => {
                            const percentage = totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(1) : 0;
                            return `
                                <div class="result-item">
                                    <div class="result-candidate">
                                        <img src="${candidate.photo}" alt="${candidate.name}">
                                        <div>
                                            <div><strong>${candidate.name}</strong></div>
                                            <div class="candidate-class">${candidate.class}</div>
                                        </div>
                                    </div>
                                    <div class="result-stats">
                                        <div class="vote-count">${candidate.voteCount}</div>
                                        <div class="vote-percentage">${percentage}%</div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    <div class="chart-container" style="position: relative;">
                        <canvas id="chart-${position.replace(/ /g, '')}"></canvas>
                    </div>
                </div>
            `;
            
            liveResultsContent.appendChild(positionResults);
            
            // Create chart
            setTimeout(() => createResultChart(position, sortedCandidates), 100);
        }
    });
}

function createResultChart(position, candidates) {
    const canvasId = `chart-${position.replace(/ /g, '')}`;
    const ctx = document.getElementById(canvasId);
    
    if (!ctx) return;
    
    const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: candidates.map(c => c.name),
            datasets: [{
                data: candidates.map(c => c.voteCount),
                backgroundColor: colors.slice(0, candidates.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                title: {
                    display: true,
                    text: `${position} Results`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                }
            }
        }
    });
}

// Activity log functions
function updateActivityLog() {
    const activityLog = document.getElementById('activityLog');
    const totalVotesCast = document.getElementById('totalVotesCast');
    const lastActivity = document.getElementById('lastActivity');
    
    if (!activityLog) return;
    
    // Update summary
    totalVotesCast.textContent = votingLog.length;
    
    if (votingLog.length > 0) {
        const lastVote = votingLog[votingLog.length - 1];
        lastActivity.textContent = formatTimestamp(new Date(lastVote.timestamp));
    } else {
        lastActivity.textContent = 'No votes cast yet';
    }
    
    // Update activity log
    const sortedLog = [...votingLog].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    activityLog.innerHTML = sortedLog.map(entry => `
        <div class="activity-item">
            <div class="activity-details">
                <h4>${entry.voterName} voted for ${entry.candidateName}</h4>
                <p>Position: ${entry.position} | Voter ID: ${entry.voterId}</p>
            </div>
            <div class="activity-timestamp">
                ${formatTimestamp(new Date(entry.timestamp))}
            </div>
        </div>
    `).join('');
}

// Utility functions
function formatTimestamp(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit',
        timeZone: 'Asia/Kolkata',
        timeZoneName: 'short'
    };
    return date.toLocaleString('en-IN', options);
}

// Modal functions
window.showAddVoterModal = function() {
    document.getElementById('addVoterModal').classList.remove('hidden');
}

window.closeAddVoterModal = function() {
    document.getElementById('addVoterModal').classList.add('hidden');
    document.getElementById('addVoterForm').reset();
}

window.showAddCandidateModal = function() {
    document.getElementById('addCandidateModal').classList.remove('hidden');
}

window.closeAddCandidateModal = function() {
    document.getElementById('addCandidateModal').classList.add('hidden');
    document.getElementById('addCandidateForm').reset();
}

// Form handlers
function handleAddVoter(e) {
    e.preventDefault();
    
    const voterId = document.getElementById('voterIdInput').value.trim();
    
    if (!voterId) {
        showNotification('Please enter a student ID', 'error');
        return;
    }
    
    if (authorizedVoters.includes(voterId)) {
        showNotification('Student ID already authorized', 'warning');
        return;
    }
    
    authorizedVoters.push(voterId);
    updateVotersList();
    closeAddVoterModal();
    showNotification('Voter ID added successfully!', 'success');
}

function handleAddCandidate(e) {
    e.preventDefault();
    
    const name = document.getElementById('candidateName').value.trim();
    const candidateClass = document.getElementById('candidateClass').value;
    const position = document.getElementById('candidatePosition').value;
    const description = document.getElementById('candidateDescription').value.trim();
    
    if (!name || !candidateClass || !position || !description) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    const newCandidate = {
        id: Math.max(...candidates.map(c => c.id)) + 1,
        name: name,
        class: candidateClass,
        position: position,
        photo: 'https://via.placeholder.com/150',
        description: description,
        voteCount: 0
    };
    
    candidates.push(newCandidate);
    updateCandidatesList();
    closeAddCandidateModal();
    showNotification('Candidate added successfully!', 'success');
}

// Admin action functions
window.removeVoterById = function(voterId) {
    if (confirm(`Are you sure you want to remove voter ID: ${voterId}?`)) {
        authorizedVoters = authorizedVoters.filter(id => id !== voterId);
        updateVotersList();
        showNotification('Voter ID removed successfully!', 'success');
    }
}

window.editCandidate = function(id) {
    showNotification('Edit functionality coming soon!', 'info');
}

window.deleteCandidate = function(id) {
    if (confirm('Are you sure you want to delete this candidate?')) {
        candidates = candidates.filter(c => c.id !== id);
        updateCandidatesList();
        updateLiveResults();
        showNotification('Candidate deleted successfully!', 'success');
    }
}

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    if (notification && notificationText) {
        notification.className = `notification ${type}`;
        notificationText.textContent = message;
        notification.classList.remove('hidden');
        
        setTimeout(() => {
            hideNotification();
        }, 5000);
    }
}

window.hideNotification = function() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.classList.add('hidden');
    }
}

// Real-time updates simulation
function startRealTimeUpdates() {
    setInterval(() => {
        // Update live results if admin is viewing them
        if (currentUser && currentUser.isAdmin && currentPage === 'adminPage') {
            const activeTab = document.querySelector('.admin-tab.active');
            if (activeTab && activeTab.id === 'adminResults') {
                updateLiveResults();
            }
            if (activeTab && activeTab.id === 'adminVoters') {
                updateVotersList();
            }
            if (activeTab && activeTab.id === 'adminActivity') {
                updateActivityLog();
            }
        }
    }, 30000); // Update every 30 seconds
}