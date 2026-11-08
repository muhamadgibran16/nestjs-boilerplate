// Hook pnpm untuk menyesuaikan metadata dependency sebelum di-resolve.
// https://pnpm.io/pnpmfile

/**
 * @prisma/client mendeklarasikan `prisma` (CLI) dan `typescript` sebagai optional peer.
 * pnpm ikut memasangnya ke dependency production karena keduanya ada di devDependencies,
 * sehingga image Docker membengkak ~200 MB (Prisma Studio, React, TypeScript).
 * Saat runtime, Prisma Client tidak membutuhkan keduanya, jadi peer tersebut dihapus.
 */
function readPackage(pkg) {
  if (pkg.name === '@prisma/client') {
    for (const peer of ['prisma', 'typescript']) {
      delete pkg.peerDependencies?.[peer];
      delete pkg.peerDependenciesMeta?.[peer];
    }
  }
  return pkg;
}

module.exports = { hooks: { readPackage } };
