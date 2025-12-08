/**
 * Authentication Debug & Clear Utility
 * 
 * Usage: Open browser console and run:
 * - checkAuth() - Check current auth status
 * - clearAuth() - Clear all auth tokens
 * - debugAuth() - Show detailed auth info
 */

// Check authentication status
window.checkAuth = function () {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const oldToken = localStorage.getItem('authToken');

    console.log('🔐 Authentication Status:');
    console.log('------------------------');
    console.log('access_token:', accessToken ? '✅ Present' : '❌ Missing');
    console.log('refresh_token:', refreshToken ? '✅ Present' : '❌ Missing');
    console.log('authToken (old):', oldToken ? '⚠️ Present (should be removed)' : '✅ Not present');
    console.log('------------------------');

    if (accessToken) {
        try {
            const payload = JSON.parse(atob(accessToken.split('.')[1]));
            const exp = new Date(payload.exp * 1000);
            const now = new Date();
            const isExpired = exp < now;

            console.log('Token expiry:', exp.toLocaleString());
            console.log('Token status:', isExpired ? '❌ EXPIRED' : '✅ Valid');
            console.log('Time remaining:', Math.floor((exp - now) / 1000 / 60), 'minutes');
        } catch (e) {
            console.log('⚠️ Could not parse token');
        }
    }

    return {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasOldToken: !!oldToken
    };
};

// Clear all authentication tokens
window.clearAuth = function () {
    console.log('🧹 Clearing all authentication tokens...');

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('authToken');

    console.log('✅ All tokens cleared!');
    console.log('💡 Please log in again');

    // Redirect to home
    setTimeout(() => {
        window.location.href = '/';
    }, 1000);
};

// Debug authentication
window.debugAuth = function () {
    console.log('🔍 Authentication Debug Info:');
    console.log('============================');

    // Check all localStorage items
    console.log('\n📦 All localStorage items:');
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        console.log(`  ${key}:`, value?.substring(0, 50) + (value.length > 50 ? '...' : ''));
    }

    // Check auth status
    console.log('\n🔐 Auth Status:');
    window.checkAuth();

    // Check if we're on the right page
    console.log('\n📍 Current Location:');
    console.log('  URL:', window.location.href);
    console.log('  Path:', window.location.pathname);

    return 'Debug complete! Check console output above.';
};

console.log('🛠️ Auth Debug Utilities Loaded!');
console.log('Available commands:');
console.log('  - checkAuth()  : Check current auth status');
console.log('  - clearAuth()  : Clear all auth tokens');
console.log('  - debugAuth()  : Show detailed debug info');
