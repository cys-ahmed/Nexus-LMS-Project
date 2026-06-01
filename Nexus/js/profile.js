(function () {
    if (!isLoggedIn()) { location.href = '../login.html'; return; }
    const u = getCurrentUser();
    if ((u?.role || '').toLowerCase() === 'admin') location.href = '../admin/admin.html';
})();
const me = getCurrentUser();
let userProfile = {
    name:       me.username || 'User',
    email:      me.email    || '',
    bio:        '',
    language:   'English',
    timezone:   'UTC',
    joinedDate: me.joined   || new Date().toISOString(),
    avatar:     null
};
function loadLocalProfile() {
    try {
        const s = localStorage.getItem('nx_user_profile_' + me.id);
        if (s) {
            const extra = JSON.parse(s);
            userProfile.bio      = extra.bio      || '';
            userProfile.language = extra.language || 'English';
            userProfile.timezone = extra.timezone || 'UTC';
            userProfile.avatar   = extra.avatar   || null;
        }
    } catch {}
}
function saveLocalProfile() {
    localStorage.setItem('nx_user_profile_' + me.id, JSON.stringify({
        bio:      userProfile.bio,
        language: userProfile.language,
        timezone: userProfile.timezone,
        avatar:   userProfile.avatar
    }));
}
function initPage() {
    setText('sidebar-user', userProfile.name);
    setText('profile-name',  userProfile.name);
    setText('profile-email', userProfile.email);
    setText('user-id',       'USR-' + String(me.id).padStart(3, '0'));
    setText('member-since',  formatDate(userProfile.joinedDate));
    setText('account-type',  me.role || 'Student');
    const initials = userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    $id('user-av').textContent = initials;
    $id('profile-avatar').dataset.initials = initials;
    if (userProfile.avatar) {
        const avatarImg = $id('avatar-img');
        avatarImg.src = userProfile.avatar;
        avatarImg.style.display = 'block';
        showEl('remove-avatar-btn');
    }
    $id('input-name').value    = userProfile.name;
    $id('input-email').value   = userProfile.email;
    $id('input-bio').value     = userProfile.bio  || '';
    $id('pref-language').value = userProfile.language;
    $id('pref-timezone').value = userProfile.timezone;
}
async function loadStats() {
    const r = await apiFetch('/enrollments?user_id=' + me.id);
    if (!r.ok) return;
    const enrolled = r.data;
    const completed = enrolled.filter(e => (e.progress || 0) === 100);
    const totalHours = Math.round(enrolled.reduce((s, e) => s + (e.progress || 0) * 0.1, 0));
    setText('stat-enrolled',     enrolled.length);
    setText('stat-completed',    completed.length);
    setText('stat-certificates', completed.length);
    setText('stat-hours',        totalHours + 'h');
}
$id('save-profile-btn').onclick = async () => {
    const name     = $id('input-name').value.trim();
    const email    = $id('input-email').value.trim();
    const bio      = $id('input-bio').value.trim();
    const language = $id('pref-language').value;
    const timezone = $id('pref-timezone').value;
    if (!name || !email) { toast({ title: 'Validation Error', desc: 'Name and email are required', err: true }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast({ title: 'Invalid Email', err: true }); return; }
    const r = await apiFetch('/profile/update', {
        method: 'POST',
        body: JSON.stringify({ user_id: me.id, username: name, email })
    });
    if (!r.ok || !r.data.success) {
        toast({ title: 'Error', desc: r.data.error || 'Update failed', err: true });
        return;
    }
    userProfile.name     = name;
    userProfile.email    = email;
    userProfile.bio      = bio;
    userProfile.language = language;
    userProfile.timezone = timezone;
    saveLocalProfile();
    const updated = { ...me, username: name, email };
    localStorage.setItem('nx_user', JSON.stringify(updated));
    setText('sidebar-user', name);
    setText('profile-name',  name);
    setText('profile-email', email);
    const newInitials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    $id('user-av').textContent = newInitials;
    toast({ title: 'Profile Updated', desc: 'Your changes have been saved' });
};
$id('logout-btn').onclick = logout;
document.querySelectorAll('.tab-btn').forEach(b => b.onclick = () => {
    document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    $id('tab-' + b.dataset.tab)?.classList.add('active');
});
$id('save-settings-btn').onclick = () => {
    userProfile.language = $id('pref-language').value;
    userProfile.timezone = $id('pref-timezone').value;
    saveLocalProfile();
    toast({ title: 'Settings Saved', desc: 'Your preferences have been updated' });
};
const initials = userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
$id('change-avatar-btn').onclick = () => { $id('avatar-upload').click(); };
$id('avatar-upload').onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast({ title: 'Invalid File', err: true }); return; }
    if (file.size > 2 * 1024 * 1024) { toast({ title: 'File Too Large', desc: 'Max 2MB', err: true }); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
        const base64Image = ev.target.result;
        $id('avatar-img').src = base64Image;
        $id('avatar-img').style.display = 'block';
        userProfile.avatar = base64Image;
        saveLocalProfile();
        showEl('remove-avatar-btn');
        toast({ title: 'Avatar Updated' });
    };
    reader.readAsDataURL(file);
};
$id('remove-avatar-btn').onclick = () => {
    if (!confirm('Remove your profile picture?')) return;
    userProfile.avatar = null;
    saveLocalProfile();
    $id('avatar-img').style.display = 'none';
    $id('profile-avatar').textContent = initials;
    hideEl('remove-avatar-btn');
    toast({ title: 'Avatar Removed' });
};
loadLocalProfile();
initPage();
loadStats();
