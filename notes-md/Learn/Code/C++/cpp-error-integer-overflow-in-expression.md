https://stackoverflow.com/questions/47218311/cpp-error-integer-overflow-in-expression



uint64_t TESTBYTES = 16ULL * 1024 * 1024 * 1024 will do it.

Else the expression 16 * 1024 * 1024 * 1024 is evaluated as an int, with undefined results on your platform since you are overflowing the int type.

ULL promotes the first term to an unsigned long long, forcing promotion of the other terms. This is always safe singe an unsigned long long needs to be at least 64 bits.