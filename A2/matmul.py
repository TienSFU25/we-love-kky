import sympy as sym

l, r, t, b, n, f = sym.symbols('l, r, t, b, n, f')

N = sym.Matrix([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, -(n+f)/(f-n), -2*n*f/(f-n)], [0, 0, -1, 0]])
S = sym.Matrix([[n/(r-l), 0, 0, 0], [0, n/(t-b), 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]])
H = sym.Matrix([[1, 0, l/n, 0], [0, 1, b/n, 0], [0, 0, 1, 0], [0, 0, 0, 1]])

M = N * S * H
print(M)

M = H * S * N
print(M)