fn main(age_months: u64, threshold: pub u64, policy: pub Field, nullifier: pub Field, qualified: pub bool) {
    assert(policy != 0); assert(nullifier != 0);
    assert(qualified == (age_months > threshold)); assert(qualified);
}
