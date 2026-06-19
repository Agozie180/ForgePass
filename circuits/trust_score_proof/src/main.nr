fn capped_points(value: u64, points: u64, target: u64) -> u64 {
    let earned = value * points / target;
    if earned > points { points } else { earned }
}

fn main(
    monthly_income_usd: u64,
    average_balance_usd: u64,
    account_age_months: u64,
    eligible_transactions: u64,
    consistent_months: u64,
    observed_months: u64,
    threshold: pub u64,
    policy_commitment: pub Field,
    holder_binding: pub Field,
    nullifier: pub Field,
    qualified: pub bool,
) {
    assert(observed_months > 0);
    assert(consistent_months <= observed_months);
    assert(threshold <= 100);

    // Public bindings are consumed by the verifier receipt and cannot be zero.
    assert(policy_commitment != 0);
    assert(holder_binding != 0);
    assert(nullifier != 0);

    let income = capped_points(monthly_income_usd, 25, 8000);
    let balance = capped_points(average_balance_usd, 20, 3000);
    let age = capped_points(account_age_months, 20, 24);
    let activity = capped_points(eligible_transactions, 20, 120);
    let consistency = consistent_months * 15 / observed_months;
    let score = income + balance + age + activity + consistency;

    assert(score <= 100);
    assert(qualified == (score > threshold));
    assert(qualified);
}

#[test]
fn demo_score_qualifies() {
    main(8000, 3000, 18, 120, 9, 12, 80, 1, 2, 3, true);
}

#[test(should_fail)]
fn low_score_cannot_claim_qualification() {
    main(1000, 200, 2, 5, 1, 12, 80, 1, 2, 3, true);
}
