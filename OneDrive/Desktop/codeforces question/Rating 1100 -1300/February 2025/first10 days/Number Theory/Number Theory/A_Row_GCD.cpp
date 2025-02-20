#include <bits/stdc++.h>
using namespace std;

#define optimise() ios::sync_with_stdio(false); cin.tie(0); cout.tie(0);
#define st(a) sort(a.begin(), a.end())
#define ll long long
#define pb push_back

const int mod = 1e9 + 7;

int main() {
    optimise();

    int n, m;
    cin >> n >> m;

    vector<int> a(n), b(m);
    for (int i = 0; i < n; i++) cin >> a[i];
    for (int i = 0; i < m; i++) cin >> b[i];

    st(a);  // Sorting the array

    vector<ll> diff(n);  // Using long long to avoid type mismatch
    for (int i = 1; i < n; i++) {
        diff[i] = (ll)a[i] - a[0];  // Convert to long long
    }

    ll gcd = 0;
    for (int i = 1; i < n; i++) {
        gcd = __gcd(gcd, diff[i]);  // Now both are long long
    }

    for (int j = 0; j < m; j++) {
        cout << __gcd(gcd, (ll)a[0] + b[j]) << " ";  // Casting to long long
    }
    cout << endl;

    return 0;
}
