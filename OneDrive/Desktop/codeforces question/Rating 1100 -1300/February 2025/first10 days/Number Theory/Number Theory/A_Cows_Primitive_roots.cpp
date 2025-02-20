#include<bits/stdc++.h>
using namespace std;
#define optimise() ios::sync_with_stdio(false); cin.tie(0); cout.tie(0);
#define st(a) sort(a.begin(),a.end());
#define in(x) int x; cin>>x; 
#define ll long long 
#define pb push_back 
const int mod = 1e9 + 7;
void solve(){
    int p;
    cin>>p;
    int ans=0;
    for(int i=1;i<=p;i++){
        vector<ll>val(p,i);

        for(int k =2;k<p;k++){
            val[k] = (val[k-1]*i)%p;

        }
        int f =0;
        for(int k =1;k<p-1;k++)
            f+=(((val[k]-1)+p)%p == 0);

            if(f == 0 && (((val[p-1]-1)+p)%p == 0)){
                  ans++;
            }
        
    }
    cout<<ans<<endl;

}
int32_t main(){
optimise();
solve();
   return 0;
}
// Submitted by Mohit Kumar