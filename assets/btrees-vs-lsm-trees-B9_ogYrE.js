const e=`# Deep Dive: B-Trees vs LSM Trees

Understanding the underlying data structures of flexible database engines like Postgres and RocksDB.


## B-Trees (Read Optimized)
Used by: **PostgreSQL, MySQL, Oracle**

- Data is stored in pages.
- Good for exact lookups and ranges.
- **Update overhead**: Random writes can cause page splitting (heavy I/O).

## LSM Trees (Write Optimized)
Used by: **Cassandra, RocksDB, LevelDB**

- Writes go to memory (MemTable) then flushed to disk (SSTable) sequentially.
- **Problem**: Read amplification (need to check multiple files).
- **Solution**: Bloom filters and compaction.

> **Rule of Thumb**: If you have a write-heavy workload (logs, IoT), consider LSM. If relatively balanced or read-heavy, B-Trees are battle-hardened.


## Conclusion

I hope this gives you a better understanding of Databases. If you enjoyed this post, check out the other articles in this series!
`;export{e as default};
