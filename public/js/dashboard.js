// dashboard.js - Dashboard page logic

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  loadDashboard();
});

async function loadDashboard() {
  try {
    const res = await fetch('/api/dashboard/stats');
    const json = await res.json();
    if (!json.success) { showToast('Failed to load dashboard', 'error'); return; }
    const data = json.data;

    // Stat cards
    document.getElementById('stat-students').textContent = data.total_students;
    document.getElementById('stat-semesters').textContent = data.total_semesters_recorded;
    document.getElementById('stat-seminars').textContent = data.total_seminars;
    document.getElementById('stat-activities').textContent = data.total_activities;

    // Dept Bar Chart
    const deptCtx = document.getElementById('deptChart').getContext('2d');
    new Chart(deptCtx, {
      type: 'bar',
      data: {
        labels: data.students_per_dept.map(d => d.dept),
        datasets: [{
          label: 'Students',
          data: data.students_per_dept.map(d => d.count),
          backgroundColor: ['#3b82f6','#22c55e','#f97316','#ef4444','#8b5cf6'],
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#f1f5f9' } },
          x: { grid: { display: false } }
        }
      }
    });

    // SGPA Trend Line Chart
    const sgpaCtx = document.getElementById('sgpaChart').getContext('2d');
    new Chart(sgpaCtx, {
      type: 'line',
      data: {
        labels: data.avg_sgpa_trend.map(s => 'Sem ' + s.semester),
        datasets: [{
          label: 'Average SGPA',
          data: data.avg_sgpa_trend.map(s => s.avg_sgpa),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.1)',
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#2563eb',
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 0, max: 10, grid: { color: '#f1f5f9' } },
          x: { grid: { display: false } }
        }
      }
    });

    // Recent Students Table
    const tbody = document.getElementById('recent-students-tbody');
    if (!data.recent_students || data.recent_students.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="loading-cell">No students found</td></tr>';
      return;
    }
    tbody.innerHTML = data.recent_students.map(s => `
      <tr>
        <td>${s.roll_no}</td>
        <td><strong>${s.full_name}</strong></td>
        <td>${s.department}</td>
        <td>${s.current_semester || '-'}</td>
        <td>${s.last_sgpa !== null ? s.last_sgpa : '-'}</td>
        <td><span class="badge badge-${s.status === 'Active' ? 'active' : 'inactive'}">${s.status}</span></td>
        <td class="action-btns">
          <button class="btn-icon" title="View" onclick="window.location='/student-detail.html?id=${s.id}'">👁</button>
          <button class="btn-icon" title="Edit" onclick="window.location='/students.html'">✏️</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
    showToast('Error loading dashboard data', 'error');
  }
}
