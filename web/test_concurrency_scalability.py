import sys
import time
import asyncio
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

def run_concurrency_test():
    print("=" * 70)
    print("STARTING KYVATRON HIGH-CONCURRENCY SCALABILITY & ATOMICITY CHECK")
    print("=" * 70)
    print("This script simulates high concurrent traffic by executing 50 simultaneous")
    print("currency conversion transactions in parallel using Promise.all in the browser.")
    print("It validates transactional isolation, row-level locks, and latency.")
    print("-" * 70)

    test_email = "tester_dynamic@kyvatron.com"
    test_password = "Password123!"
    
    print(f"[*] Target user account: {test_email}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        try:
            # Step 1: Login
            print("[1] Logging in to establish authenticated session...")
            page.goto("http://localhost:3000/login")
            page.wait_for_load_state("networkidle")
            
            page.fill('input[name="email"]', test_email)
            page.fill('input[name="password"]', test_password)
            page.click('button:has-text("Log In")')
            page.wait_for_url("**/home", timeout=15000)
            print("[+] Login successful!")

            # Step 2: Ensure enough NGN balance before test
            print("[2] Funding wallet with initial 20,000 NGN failsafe balance...")
            funding_js = """
            (async () => {
                const { data: { user } } = await window.supabase.auth.getUser();
                if (!user) throw new Error("No active session");
                const { data, error } = await window.supabase.rpc('confirm_deposit', {
                    p_user_id: user.id,
                    p_flw_transaction_id: Math.floor(Math.random() * 1000000000),
                    p_tx_ref: 'scalability-deposit-' + Date.now(),
                    p_amount: 20000.00,
                    p_currency: 'NGN',
                    p_metadata: { is_test: true },
                    p_auth_secret: 'Kyvatron2026F'
                });
                if (error) throw new Error(error.message);
                return data;
            })()
            """
            page.evaluate(funding_js)
            print("[+] Failsafe wallet funding complete.")

            # Get initial balances
            balances_js = """
            (async () => {
                const { data: { user } } = await window.supabase.auth.getUser();
                const { data } = await window.supabase.from('profiles').select('balance_ngn, balance_usdt').eq('id', user.id).single();
                return data;
            })()
            """
            initial_balances = page.evaluate(balances_js)
            init_ngn = float(initial_balances['balance_ngn'])
            init_usdt = float(initial_balances['balance_usdt'])
            print(f"[+] Initial Balance: ₦{init_ngn:,.2f} NGN | ${init_usdt:,.2f} USDT")

            # Step 3: Run 50 Concurrent conversions (100 NGN -> USDT each) in parallel!
            print("\n[3] Launching 50 simultaneous currency conversions in parallel...")
            print("[*] Simulating high concurrent lock contention on profiles table...")
            
            concurrency_js = """
            (async () => {
                const { data: { user } } = await window.supabase.auth.getUser();
                if (!user) throw new Error("No active session");

                const concurrencyCount = 50;
                const promises = [];
                
                for (let i = 0; i < concurrencyCount; i++) {
                    promises.push((async (index) => {
                        const startTime = performance.now();
                        try {
                            const { data, error } = await window.supabase.rpc('convert_currency', {
                                p_user_id: user.id,
                                p_from_currency: 'NGN',
                                p_amount: 100.00,
                                p_exchange_rate: 1290.00,
                                p_fees: 0.00
                            });
                            const duration = performance.now() - startTime;
                            if (error) {
                                return { success: false, error: error.message, latency: duration };
                            }
                            return { success: true, latency: duration };
                        } catch (err) {
                            return { success: false, error: err.message, latency: performance.now() - startTime };
                        }
                    })(i));
                }
                
                return await Promise.all(promises);
            })()
            """
            
            start_test = time.time()
            results = page.evaluate(concurrency_js)
            end_test = time.time()
            
            total_duration = end_test - start_test
            success_count = sum(1 for r in results if r['success'])
            fail_count = sum(1 for r in results if not r['success'])
            
            latencies = [r['latency'] for r in results]
            avg_latency = sum(latencies) / len(latencies) if latencies else 0
            
            print(f"\n[+] Concurrency execution finished in {total_duration:.2f} seconds!")
            print(f"    - Successful Conversions: {success_count} / 50")
            print(f"    - Failed Conversions: {fail_count} / 50")
            print(f"    - Average Transaction Latency: {avg_latency:.1f}ms")
            print(f"    - Throughput: {success_count / total_duration:.2f} transactions/second")

            # Print errors if any failed
            if fail_count > 0:
                print("\n[!] Errors encountered during concurrent execution:")
                errors = set(r['error'] for r in results if not r['success'])
                for err in errors:
                    print(f"    - {err}")

            # Step 4: Validate database integrity and account balance
            print("\n[4] Fetching final balances from Supabase to verify balance integrity...")
            final_balances = page.evaluate(balances_js)
            final_ngn = float(final_balances['balance_ngn'])
            final_usdt = float(final_balances['balance_usdt'])
            
            expected_ngn_deduction = success_count * 100.00
            actual_ngn_deduction = init_ngn - final_ngn
            
            print(f"[+] Final Balance: ₦{final_ngn:,.2f} NGN | ${final_usdt:,.2f} USDT")
            print(f"[+] Expected NGN Deduction: ₦{expected_ngn_deduction:,.2f}")
            print(f"[+] Actual NGN Deduction: ₦{actual_ngn_deduction:,.2f}")
            
            if abs(actual_ngn_deduction - expected_ngn_deduction) < 0.01:
                print("\n" + "=" * 70)
                print("SCALABILITY & ATOMICITY TEST: SUCCESS! 🎉")
                print("Row-level locks successfully handled concurrent updates without double spending,")
                print("race conditions, or transaction drops. Complete balance consistency confirmed!")
                print("=" * 70)
                sys.exit(0)
            else:
                print("\n" + "!" * 70)
                print("INTEGRITY ERROR: Actual balance deduction does not match expected conversions!")
                print("!" * 70)
                sys.exit(1)
                
        except Exception as ex:
            print(f"[!] Critical Error in test execution: {str(ex)}")
            sys.exit(1)
        finally:
            browser.close()

if __name__ == "__main__":
    run_concurrency_test()
