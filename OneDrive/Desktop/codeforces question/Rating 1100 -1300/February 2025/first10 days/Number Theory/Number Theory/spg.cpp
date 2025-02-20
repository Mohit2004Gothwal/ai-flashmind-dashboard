#include<bits/stdc++.h>
using namespace std;
#define optimise() ios::sync_with_stdio(false); cin.tie(0); cout.tie(0);
#define st(a) sort(a.begin(),a.end());
#define in(x) int x; cin>>x; 
#define ll long long 
#define pb push_back 
const int mod = 1e9 + 7;
const int N = 1000000;
int sieve[1000001];
int spf[N+1];

// Time Complexity = O(nlog(logn))       
void siv(){
    for(int i =2 ;i<=1e6;i++){
        sieve[i] =1; 
    }
    for(int i=2;i*i<=N;i++){
          if(sieve[i] == 0)continue;
          for(int j = i*i;j<=N;j+=i){
            sieve[j] = 0; 
          }
    }
    int l ,r;
    cin>>l>>r;
    int size = r-l+1;
    int dummy[size];
    for(int i=0;i<size;i++){
        dummy[i]=1;
    }
    for(int i=2;i*i<=r;i++ )
    {
        if(sieve[i]==1){
            int initial = (l/i) *i;
            if(initial <l){
                initial += i;
            }
            initial = max(i*i ,initial);
            for(int j = initial - 1;j<size;j+=i){
                dummy[j] = 0;
            } 
        }
    }
    int cnt= 0;
     for(int i=0;i<size;i++){
        if(dummy[i] == 1){
            cnt++;
        }
     }   
     cout<<cnt<<endl;
}
bool is_prime(int n){
    int cnt =0;
    for(int i=1;i*i<=n;i++){
        if(n%i==0){
            cnt++;
            if(n/i != i)
            {
                cnt++;
            }
        } 
    }
    if(cnt ==2)return true;
    return false;
}
int sieve_of_erastotences(int l ,int r , int n){
    int cnt =0;
    for(int i=l;i<=r;i++){
        if(sieve[i]==1){
            cnt++;
        }
    }
    return cnt; 
}

//  For Prime 
// T.c = O(root(n))
vector<int>prime(int n){
    vector<int>res;
    for(int i=2;i*i<=n;i++){
         while(n%i == 0){
            n = n/i;
            res.pb(i);
         }
    } 
    if(n>1 ){
        res.pb(n); 
    }
}

// For Smallest Prime Factorisation
void spfgen(){
    for(int i=2;i<=N;i++){
        spf[i] = i;
    }
    for(int i=2;i*i<=N;i++){
         if(spf[i]!= i)continue;
         for(int j =i*i;j<=N;j+=i){
            if(spf[j] ==j){
              spf[j]= i;   
            }
         } 
    }
   int q;cin>>q;
   while(q--){
    int k;cin>>k;
    while(k!=1){
        cout<<spf[k]<<" ";
        k = k/spf[k];
    }
    cout<<endl;
   }
}
void solve(){  
    int n;
    cin>>n;
    int l ,r;
    // cin>>l>>r;
    if(is_prime(n)){
        cout<<"prime" <<endl;
    }else{
        cout<<"NOT PRIME" <<endl;
    }
    // int cnt = sieve_of_erastotences(l ,r , n);
    // cout<<cnt<<endl;

    // // for all prime numbers of n 
    // vector<int>pri = prime(n);
    // for(int i=0;i<pri.size();i++){
    //     cout<<pri[i]<<" ";
    // }
    // cout<<endl;

    spfgen();
}
int32_t main(){
optimise();
int t;
cin>>t;
while(t--){
    solve();
}
   return 0;
}
// Submitted by Mohit Kumar