// ===== ABSENSI APP - MAIN APPLICATION =====
class AbsensiApp {
    constructor() {
        // Data storage keys
        this.STORAGE_KEYS = {
            USER: 'absensi_user_profile',
            DATA: 'absensi_records',
            SETTINGS: 'absensi_settings'
        };
        
        // App state
        this.state = {
            currentUser: null,
            attendanceData: [],
            selectedDate: new Date(),
            currentPage: 1,
            itemsPerPage: 10,
            filters: {
                month: '',
                year: ''
            }
        };
        
        // DOM Elements cache
        this.elements = {};
        
        // Initialize app
        this.init();
    }
    
    // ===== INITIALIZATION =====
    async init() {
        try {
            // Cache DOM elements
            this.cacheElements();
            
            // Load data from localStorage
            this.loadData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Update datetime display
            this.updateDateTime();
            setInterval(() => this.updateDateTime(), 1000);
            
            // Populate year filter
            this.populateYearFilter();
            
            // Render initial UI
            this.renderUI();
            
            console.log('Absensi App initialized successfully');
            
        } catch (error) {
            console.error('Error initializing app:', error);
            this.showNotification('Error initializing application', 'error');
        }
    }
    
    cacheElements() {
        // User elements
        this.elements.userNameDisplay = document.getElementById('userNameDisplay');
        this.elements.userModal = document.getElementById('userModal');
        this.elements.userNameInput = document.getElementById('userNameInput');
        this.elements.userDepartment = document.getElementById('userDepartment');
        this.elements.userMenuBtn = document.getElementById('userMenuBtn');
        this.elements.saveUserBtn = document.getElementById('saveUserBtn');
        this.elements.closeModalBtn = document.getElementById('closeModalBtn');
        this.elements.dataCount = document.getElementById('dataCount');
        this.elements.exportAllBtn = document.getElementById('exportAllBtn');
        
        // Datetime elements
        this.elements.currentDay = document.getElementById('currentDay');
        this.elements.currentDate = document.getElementById('currentDate');
        this.elements.currentTime = document.getElementById('currentTime');
        this.elements.datePicker = document.getElementById('datePicker');
        this.elements.prevDayBtn = document.getElementById('prevDayBtn');
        this.elements.nextDayBtn = document.getElementById('nextDayBtn');
        this.elements.todayBtn = document.getElementById('todayBtn');
        
        // Attendance buttons
        this.elements.clockInBtn = document.getElementById('clockInBtn');
        this.elements.breakOutBtn = document.getElementById('breakOutBtn');
        this.elements.breakInBtn = document.getElementById('breakInBtn');
        this.elements.clockOutBtn = document.getElementById('clockOutBtn');
        
        // Status displays
        this.elements.checkinStatus = document.getElementById('checkinStatus');
        this.elements.breakoutStatus = document.getElementById('breakoutStatus');
        this.elements.breakinStatus = document.getElementById('breakinStatus');
        this.elements.checkoutStatus = document.getElementById('checkoutStatus');
        this.elements.totalWorkHours = document.getElementById('totalWorkHours');
        this.elements.todayStatus = document.getElementById('todayStatus');
        this.elements.lastUpdate = document.getElementById('lastUpdate');
        
        // History elements
        this.elements.monthFilter = document.getElementById('monthFilter');
        this.elements.yearFilter = document.getElementById('yearFilter');
        this.elements.printBtn = document.getElementById('printBtn');
        this.elements.exportBtn = document.getElementById('exportBtn');
        this.elements.refreshBtn = document.getElementById('refreshBtn');
        this.elements.attendanceTableBody = document.getElementById('attendanceTableBody');
        this.elements.currentPage = document.getElementById('currentPage');
        this.elements.totalPages = document.getElementById('totalPages');
        this.elements.prevPageBtn = document.getElementById('prevPageBtn');
        this.elements.nextPageBtn = document.getElementById('nextPageBtn');
        this.elements.totalRecords = document.getElementById('totalRecords');
        this.elements.averageHours = document.getElementById('averageHours');
        
        // Statistics elements
        this.elements.totalDays = document.getElementById('totalDays');
        this.elements.totalMonthHours = document.getElementById('totalMonthHours');
        this.elements.avgDailyHours = document.getElementById('avgDailyHours');
        this.elements.attendanceRate = document.getElementById('attendanceRate');
        
        // Footer elements
        this.elements.backupBtn = document.getElementById('backupBtn');
        this.elements.restoreBtn = document.getElementById('restoreBtn');
        this.elements.helpBtn = document.getElementById('helpBtn');
        this.elements.restoreFileInput = document.getElementById('restoreFileInput');
        
        // Notification & loading
        this.elements.notification = document.getElementById('notification');
        this.elements.loadingOverlay = document.getElementById('loadingOverlay');
    }
    
    // ===== DATA MANAGEMENT =====
    loadData() {
        try {
            // Load user profile
            const userData = localStorage.getItem(this.STORAGE_KEYS.USER);
            this.state.currentUser = userData ? JSON.parse(userData) : {
                name: 'Guest',
                department: '',
                createdAt: new Date().toISOString()
            };
            
            // Load attendance data
            const attendanceData = localStorage.getItem(this.STORAGE_KEYS.DATA);
            this.state.attendanceData = attendanceData ? JSON.parse(attendanceData) : [];
            
            // Load settings
            const settings = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
            if (settings) {
                const parsedSettings = JSON.parse(settings);
                this.state.itemsPerPage = parsedSettings.itemsPerPage || 10;
            }
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.state.currentUser = { name: 'Guest', department: '' };
            this.state.attendanceData = [];
        }
    }
    
    saveData() {
        try {
            localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(this.state.currentUser));
            localStorage.setItem(this.STORAGE_KEYS.DATA, JSON.stringify(this.state.attendanceData));
            localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify({
                itemsPerPage: this.state.itemsPerPage
            }));
        } catch (error) {
            console.error('Error saving data:', error);
            this.showNotification('Error saving data to storage', 'error');
        }
    }
    
    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // User modal
        this.elements.userMenuBtn.addEventListener('click', () => this.showUserModal());
        this.elements.saveUserBtn.addEventListener('click', () => this.saveUserProfile());
        this.elements.closeModalBtn.addEventListener('click', () => this.hideUserModal());
        this.elements.exportAllBtn.addEventListener('click', () => this.exportAllData());
        
        // Date controls
        this.elements.prevDayBtn.addEventListener('click', () => this.changeDate(-1));
        this.elements.nextDayBtn.addEventListener('click', () => this.changeDate(1));
        this.elements.todayBtn.addEventListener('click', () => this.goToToday());
        this.elements.datePicker.addEventListener('change', (e) => {
            this.state.selectedDate = new Date(e.target.value);
            this.renderUI();
        });
        
        // Attendance buttons
        this.elements.clockInBtn.addEventListener('click', () => this.recordAttendance('checkin'));
        this.elements.breakOutBtn.addEventListener('click', () => this.recordAttendance('breakout'));
        this.elements.breakInBtn.addEventListener('click', () => this.recordAttendance('breakin'));
        this.elements.clockOutBtn.addEventListener('click', () => this.recordAttendance('checkout'));
        
        // History controls
        this.elements.monthFilter.addEventListener('change', (e) => {
            this.state.filters.month = e.target.value;
            this.state.currentPage = 1;
            this.renderHistory();
        });
        
        this.elements.yearFilter.addEventListener('change', (e) => {
            this.state.filters.year = e.target.value;
            this.state.currentPage = 1;
            this.renderHistory();
        });
        
        this.elements.printBtn.addEventListener('click', () => window.print());
        this.elements.exportBtn.addEventListener('click', () => this.exportHistory());
        this.elements.refreshBtn.addEventListener('click', () => this.renderUI());
        
        // Pagination
        this.elements.prevPageBtn.addEventListener('click', () => this.changePage(-1));
        this.elements.nextPageBtn.addEventListener('click', () => this.changePage(1));
        
        // Footer buttons
        this.elements.backupBtn.addEventListener('click', () => this.exportAllData());
        this.elements.restoreBtn.addEventListener('click', () => this.elements.restoreFileInput.click());
        this.elements.helpBtn.addEventListener('click', () => this.showHelp());
        this.elements.restoreFileInput.addEventListener('change', (e) => this.restoreData(e));
        
        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target === this.elements.userModal) {
                this.hideUserModal();
            }
        });
    }
    
    // ===== USER PROFILE =====
    showUserModal() {
        this.elements.userNameInput.value = this.state.currentUser.name || '';
        this.elements.userDepartment.value = this.state.currentUser.department || '';
        this.elements.dataCount.textContent = this.state.attendanceData.length;
        this.elements.userModal.style.display = 'flex';
    }
    
    hideUserModal() {
        this.elements.userModal.style.display = 'none';
    }
    
    saveUserProfile() {
        const name = this.elements.userNameInput.value.trim();
        const department = this.elements.userDepartment.value.trim();
        
        if (!name) {
            this.showNotification('Nama tidak boleh kosong', 'error');
            return;
        }
        
        this.state.currentUser = {
            ...this.state.currentUser,
            name,
            department,
            updatedAt: new Date().toISOString()
        };
        
        this.saveData();
        this.renderUI();
        this.hideUserModal();
        this.showNotification('Profil berhasil disimpan', 'success');
    }
    
    // ===== DATE & TIME =====
    updateDateTime() {
        const now = new Date();
        
        // Format day names in Indonesian
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                       'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        
        // Update day and date
        this.elements.currentDay.textContent = days[now.getDay()];
        this.elements.currentDate.textContent = 
            `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
        
        // Update time
        this.elements.currentTime.textContent = 
            now.toLocaleTimeString('id-ID', { hour12: false });
        
        // Update date picker
        this.elements.datePicker.valueAsDate = this.state.selectedDate;
    }
    
    changeDate(days) {
        const newDate = new Date(this.state.selectedDate);
        newDate.setDate(newDate.getDate() + days);
        this.state.selectedDate = newDate;
        this.renderUI();
    }
    
    goToToday() {
        this.state.selectedDate = new Date();
        this.renderUI();
        this.showNotification('Kembali ke hari ini', 'info');
    }
    
    // ===== ATTENDANCE RECORDING =====
    recordAttendance(type) {
        if (this.state.currentUser.name === 'Guest') {
            this.showNotification('Harap isi nama terlebih dahulu di pengaturan', 'error');
            this.showUserModal();
            return;
        }
        
        const now = new Date();
        const dateKey = this.formatDateKey(this.state.selectedDate);
        const timeString = now.toLocaleTimeString('id-ID', { hour12: false });
        
        // Find or create today's record
        let record = this.state.attendanceData.find(r => r.date === dateKey);
        
        if (!record) {
            record = {
                id: Date.now(),
                date: dateKey,
                userName: this.state.currentUser.name,
                department: this.state.currentUser.department,
                checkin: '',
                breakout: '',
                breakin: '',
                checkout: '',
                totalHours: 0,
                createdAt: now.toISOString(),
                updatedAt: now.toISOString()
            };
            this.state.attendanceData.push(record);
        }
        
        // Update record based on type
        const typeLabels = {
            checkin: 'Check-In',
            breakout: 'Istirahat Keluar',
            breakin: 'Istirahat Masuk',
            checkout: 'Check-Out'
        };
        
        const previousTime = record[type];
        record[type] = timeString;
        record.updatedAt = now.toISOString();
        
        // Calculate total hours if checkout
        if (type === 'checkout') {
            record.totalHours = this.calculateWorkHours(record);
        }
        
        // Save data
        this.saveData();
        
        // Show notification
        if (previousTime) {
            this.showNotification(
                `${typeLabels[type]} diupdate: ${previousTime} → ${timeString}`,
                'warning'
            );
        } else {
            this.showNotification(
                `Berhasil ${typeLabels[type]} pada ${timeString}`,
                'success'
            );
        }
        
        // Update UI
        this.renderUI();
    }
    
    calculateWorkHours(record) {
        if (!record.checkin || !record.checkout) return 0;
        
        const checkinTime = this.timeStringToMinutes(record.checkin);
        const checkoutTime = this.timeStringToMinutes(record.checkout);
        
        let workMinutes = checkoutTime - checkinTime;
        
        // Subtract break time if exists
        if (record.breakout && record.breakin) {
            const breakoutTime = this.timeStringToMinutes(record.breakout);
            const breakinTime = this.timeStringToMinutes(record.breakin);
            workMinutes -= (breakinTime - breakoutTime);
        }
        
        // Ensure minimum 0 and maximum 24 hours
        workMinutes = Math.max(0, Math.min(workMinutes, 24 * 60));
        
        return Math.round((workMinutes / 60) * 100) / 100;
    }
    
    timeStringToMinutes(timeString) {
        try {
            const [hours, minutes, seconds] = timeString.split(':').map(Number);
            return hours * 60 + minutes + (seconds || 0) / 60;
        } catch (error) {
            return 0;
        }
    }
    
    formatDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // ===== UI RENDERING =====
    renderUI() {
        // Update user display
        this.elements.userNameDisplay.textContent = this.state.currentUser.name;
        
        // Update today's attendance status
        this.renderTodayStatus();
        
        // Update history table
        this.renderHistory();
        
        // Update statistics
        this.renderStatistics();
    }
    
    renderTodayStatus() {
        const dateKey = this.formatDateKey(this.state.selectedDate);
        const record = this.state.attendanceData.find(r => r.date === dateKey);
        
        // Update status displays
        this.elements.checkinStatus.textContent = record?.checkin || '-';
        this.elements.breakoutStatus.textContent = record?.breakout || '-';
        this.elements.breakinStatus.textContent = record?.breakin || '-';
        this.elements.checkoutStatus.textContent = record?.checkout || '-';
        
        // Update total work hours
        if (record?.totalHours) {
            const hours = Math.floor(record.totalHours);
            const minutes = Math.round((record.totalHours - hours) * 60);
            this.elements.totalWorkHours.textContent = `${hours} jam ${minutes} menit`;
            this.elements.todayStatus.textContent = record.checkout ? 'Selesai' : 'Sedang Bekerja';
        } else {
            this.elements.totalWorkHours.textContent = '0 jam 0 menit';
            this.elements.todayStatus.textContent = record?.checkin ? 'Sedang Bekerja' : 'Belum Check-In';
        }
        
        // Update last update
        if (record?.updatedAt) {
            const updateTime = new Date(record.updatedAt);
            this.elements.lastUpdate.textContent = 
                updateTime.toLocaleTimeString('id-ID', { hour12: false });
        } else {
            this.elements.lastUpdate.textContent = '-';
        }
        
        // Enable/disable buttons based on status
        this.elements.clockInBtn.disabled = !!record?.checkin;
        this.elements.breakOutBtn.disabled = !record?.checkin || !!record?.breakout;
        this.elements.breakInBtn.disabled = !record?.breakout || !!record?.breakin;
        this.elements.clockOutBtn.disabled = !record?.checkin || !!record?.checkout;
    }
    
    populateYearFilter() {
        const currentYear = new Date().getFullYear();
        const yearFilter = this.elements.yearFilter;
        
        // Clear existing options except first
        while (yearFilter.options.length > 1) {
            yearFilter.remove(1);
        }
        
        // Add years from 2020 to current year + 1
        for (let year = 2020; year <= currentYear + 1; year++) {
            const option = document.createElement('option');
            option.value = year.toString();
            option.textContent = year;
            yearFilter.appendChild(option);
        }
        
        // Set current year as default
        yearFilter.value = currentYear.toString();
        this.state.filters.year = currentYear.toString();
    }
    
    renderHistory() {
        // Filter data
        let filteredData = [...this.state.attendanceData];
        
        // Apply month filter
        if (this.state.filters.month) {
            filteredData = filteredData.filter(record => {
                const recordMonth = new Date(record.date).getMonth() + 1;
                return recordMonth.toString() === this.state.filters.month;
            });
        }
        
        // Apply year filter
        if (this.state.filters.year) {
            filteredData = filteredData.filter(record => {
                const recordYear = new Date(record.date).getFullYear();
                return recordYear.toString() === this.state.filters.year;
            });
        }
        
        // Sort by date (newest first)
        filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Calculate pagination
        const totalItems = filteredData.length;
        const totalPages = Math.ceil(totalItems / this.state.itemsPerPage);
        const startIndex = (this.state.currentPage - 1) * this.state.itemsPerPage;
        const endIndex = startIndex + this.state.itemsPerPage;
        const pageData = filteredData.slice(startIndex, endIndex);
        
        // Update pagination controls
        this.elements.currentPage.textContent = this.state.currentPage;
        this.elements.totalPages.textContent = totalPages;
        this.elements.totalRecords.textContent = totalItems;
        this.elements.prevPageBtn.disabled = this.state.currentPage <= 1;
        this.elements.nextPageBtn.disabled = this.state.currentPage >= totalPages;
        
        // Calculate average hours
        const validRecords = filteredData.filter(r => r.totalHours > 0);
        const totalHours = validRecords.reduce((sum, r) => sum + r.totalHours, 0);
        const avgHours = validRecords.length > 0 ? (totalHours / validRecords.length).toFixed(1) : 0;
        this.elements.averageHours.textContent = avgHours;
        
        // Render table
        this.renderTable(pageData);
    }
    
    renderTable(data) {
        const tbody = this.elements.attendanceTableBody;
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="no-data">
                        <i class="fas fa-database"></i>
                        <div>
                            <p>Tidak ada data absensi</p>
                            <small>Mulai dengan menekan tombol Check-In</small>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        data.forEach(record => {
            const date = new Date(record.date);
            const days = ['Ming', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
                          'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            
            const formattedDate = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
            const dayName = days[date.getDay()];
            
            const totalHours = record.totalHours || 0;
            const hours = Math.floor(totalHours);
            const minutes = Math.round((totalHours - hours) * 60);
            const totalText = totalHours > 0 ? `${hours}j ${minutes}m` : '-';
            
            const isComplete = record.checkin && record.checkout;
            const statusClass = isComplete ? 'status-complete' : 'status-incomplete';
            const statusText = isComplete ? 'Lengkap' : 'Belum';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${dayName}</td>
                <td>${record.checkin || '-'}</td>
                <td>${record.breakout || '-'}</td>
                <td>${record.breakin || '-'}</td>
                <td>${record.checkout || '-'}</td>
                <td>${totalText}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn-edit" onclick="app.editRecord('${record.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
    
    renderStatistics() {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();
        
        // Filter this month's data
        const monthData = this.state.attendanceData.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate.getMonth() + 1 === currentMonth && 
                   recordDate.getFullYear() === currentYear;
        });
        
        // Calculate statistics
        const totalDays = monthData.length;
        const completedDays = monthData.filter(r => r.checkin && r.checkout).length;
        const totalHours = monthData.reduce((sum, r) => sum + (r.totalHours || 0), 0);
        const avgDailyHours = completedDays > 0 ? (totalHours / completedDays).toFixed(1) : 0;
        const attendanceRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
        
        // Update display
        this.elements.totalDays.textContent = totalDays;
        this.elements.totalMonthHours.textContent = totalHours.toFixed(1);
        this.elements.avgDailyHours.textContent = avgDailyHours;
        this.elements.attendanceRate.textContent = `${attendanceRate}%`;
    }
    
    // ===== PAGINATION =====
    changePage(direction) {
        const newPage = this.state.currentPage + direction;
        
        // Get total pages
        const filteredData = this.getFilteredData();
        const totalPages = Math.ceil(filteredData.length / this.state.itemsPerPage);
        
        if (newPage >= 1 && newPage <= totalPages) {
            this.state.currentPage = newPage;
            this.renderHistory();
        }
    }
    
    getFilteredData() {
        let filteredData = [...this.state.attendanceData];
        
        if (this.state.filters.month) {
            filteredData = filteredData.filter(record => {
                const recordMonth = new Date(record.date).getMonth() + 1;
                return recordMonth.toString() === this.state.filters.month;
            });
        }
        
        if (this.state.filters.year) {
            filteredData = filteredData.filter(record => {
                const recordYear = new Date(record.date).getFullYear();
                return recordYear.toString() === this.state.filters.year;
            });
        }
        
        return filteredData;
    }
    
    // ===== DATA EXPORT/IMPORT =====
    exportHistory() {
        const filteredData = this.getFilteredData();
        
        if (filteredData.length === 0) {
            this.showNotification('Tidak ada data untuk diexport', 'warning');
            return;
        }
        
        // Convert to CSV
        const headers = ['Tanggal', 'Hari', 'Nama', 'Departemen', 'Check-In', 'Istirahat Keluar', 
                        'Istirahat Masuk', 'Check-Out', 'Total Jam', 'Status'];
        
        const rows = filteredData.map(record => {
            const date = new Date(record.date);
            const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const dayName = days[date.getDay()];
            
            const totalHours = record.totalHours || 0;
            const hours = Math.floor(totalHours);
            const minutes = Math.round((totalHours - hours) * 60);
            const totalText = totalHours > 0 ? `${hours} jam ${minutes} menit` : '-';
            
            const status = record.checkin && record.checkout ? 'Lengkap' : 'Belum Lengkap';
            
            return [
                record.date,
                dayName,
                record.userName,
                record.department || '-',
                record.checkin || '-',
                record.breakout || '-',
                record.breakin || '-',
                record.checkout || '-',
                totalText,
                status
            ];
        });
        
        this.downloadCSV([headers, ...rows], `absensi-${new Date().toISOString().split('T')[0]}.csv`);
        this.showNotification(`Data berhasil diexport (${filteredData.length} records)`, 'success');
    }
    
    exportAllData() {
        if (this.state.attendanceData.length === 0) {
            this.showNotification('Tidak ada data untuk dibackup', 'warning');
            return;
        }
        
        // Create backup object
        const backup = {
            app: 'Absensi Kerja',
            version: '1.0',
            exportedAt: new Date().toISOString(),
            user: this.state.currentUser,
            data: this.state.attendanceData
        };
        
        // Convert to JSON and download
        const dataStr = JSON.stringify(backup, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `absensi-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showNotification(`Backup berhasil (${this.state.attendanceData.length} records)`, 'success');
    }
    
    restoreData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const backup = JSON.parse(e.target.result);
                
                // Validate backup format
                if (!backup.data || !Array.isArray(backup.data)) {
                    throw new Error('Format file backup tidak valid');
                }
                
                // Show confirmation dialog
                if (confirm(`Restore ${backup.data.length} records?\nData saat ini akan diganti.`)) {
                    this.state.attendanceData = backup.data;
                    if (backup.user) {
                        this.state.currentUser = backup.user;
                    }
                    this.saveData();
                    this.renderUI();
                    this.showNotification(`Data berhasil direstore (${backup.data.length} records)`, 'success');
                }
                
            } catch (error) {
                console.error('Error restoring data:', error);
                this.showNotification('Error restore data: ' + error.message, 'error');
            }
            
            // Clear file input
            event.target.value = '';
        };
        
        reader.readAsText(file);
    }
    
    downloadCSV(data, filename) {
        const csvContent = data.map(row => 
            row.map(cell => `"${cell}"`).join(',')
        ).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // ===== EDIT RECORD =====
    editRecord(recordId) {
        const record = this.state.attendanceData.find(r => r.id === parseInt(recordId));
        if (!record) return;
        
        // Create edit modal
        const editHTML = `
            <h3>Edit Absensi - ${record.date}</h3>
            <div class="edit-form">
                <div class="form-row">
                    <label>Check-In:</label>
                    <input type="time" id="editCheckin" value="${record.checkin || ''}" step="1">
                </div>
                <div class="form-row">
                    <label>Istirahat Keluar:</label>
                    <input type="time" id="editBreakout" value="${record.breakout || ''}" step="1">
                </div>
                <div class="form-row">
                    <label>Istirahat Masuk:</label>
                    <input type="time" id="editBreakin" value="${record.breakin || ''}" step="1">
                </div>
                <div class="form-row">
                    <label>Check-Out:</label>
                    <input type="time" id="editCheckout" value="${record.checkout || ''}" step="1">
                </div>
                <div class="form-actions">
                    <button onclick="app.saveEdit('${recordId}')" class="btn-primary">Simpan</button>
                    <button onclick="app.closeEdit()" class="btn-secondary">Batal</button>
                </div>
            </div>
        `;
        
        // Show edit modal (simplified for now)
        const confirmEdit = confirm('Edit record ini? (Fitur lengkap akan diimplementasi kemudian)');
        if (confirmEdit) {
            this.showNotification('Fitur edit akan tersedia dalam update berikutnya', 'info');
        }
    }
    
    // ===== HELPER METHODS =====
    showNotification(message, type = 'success') {
        const notification = this.elements.notification;
        notification.textContent = message;
        notification.className = 'notification';
        notification.classList.add(type, 'show');
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    showLoading(show) {
        this.elements.loadingOverlay.style.display = show ? 'flex' : 'none';
    }
    
    showHelp() {
        const helpContent = `
            <h3>📚 Panduan Penggunaan</h3>
            <div class="help-content">
                <h4>1. Setup Awal</h4>
                <p>• Klik ikon profil di kanan atas untuk mengisi nama</p>
                <p>• Data akan otomatis tersimpan di browser Anda</p>
                
                <h4>2. Cara Absensi</h4>
                <p>• <strong>Check-In</strong>: Saat mulai kerja</p>
                <p>• <strong>Istirahat</strong>: Saat keluar istirahat</p>
                <p>• <strong>Kembali</strong>: Saat kembali dari istirahat</p>
                <p>• <strong>Check-Out</strong>: Saat pulang kerja</p>
                
                <h4>3. Fitur Lain</h4>
                <p>• <strong>Export CSV</strong>: Download data dalam format spreadsheet</p>
                <p>• <strong>Backup/Restore</strong>: Simpan dan pulihkan data</p>
                <p>• <strong>Filter</strong>: Lihat data per bulan/tahun</p>
                
                <h4>4. Catatan Penting</h4>
                <p>• Data disimpan secara lokal di browser</p>
                <p>• Untuk backup, gunakan fitur Export CSV</p>
                <p>• Aplikasi ini bisa diakses offline</p>
            </div>
        `;
        
        alert('Panduan Penggunaan:\n\n1. Isi nama di profil terlebih dahulu\n2. Gunakan tombol absensi sesuai waktu kerja\n3. Data otomatis tersimpan di browser\n4. Export data untuk backup\n\nUntuk info lengkap, kunjungi dokumentasi aplikasi.');
    }
}

// ===== GLOBAL APP INSTANCE =====
let app;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app = new AbsensiApp();
    
    // Make app available globally for debugging
    window.app = app;
    
    // Add inline styles for edit modal
    const style = document.createElement('style');
    style.textContent = `
        .no-data {
            text-align: center;
            padding: 40px !important;
            color: #95a5a6;
        }
        
        .no-data i {
            font-size: 3rem;
            margin-bottom: 15px;
            display: block;
            opacity: 0.5;
        }
        
        .no-data p {
            font-size: 1.1rem;
            margin-bottom: 5px;
        }
        
        .no-data small {
            font-size: 0.9rem;
            opacity: 0.7;
        }
        
        .edit-form {
            margin: 20px 0;
        }
        
        .form-row {
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .form-row label {
            min-width: 120px;
            font-weight: 600;
        }
        
        .form-row input {
            padding: 8px 12px;
            border: 2px solid #dfe6e9;
            border-radius: 6px;
            font-size: 14px;
            flex: 1;
        }
        
        .form-actions {
            display: flex;
            gap: 10px;
            margin-top: 25px;
            justify-content: flex-end;
        }
    `;
    document.head.appendChild(style);
});

// ===== SERVICE WORKER FOR OFFLINE SUPPORT =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}
