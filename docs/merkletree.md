# Merkle Tree Structure

Requirements:
- Must be compatible with the Semaphore MT structure. In particular, a path delivered by the InterRep API must be suitable for use as an input to the Semaphore SNARK circuit that verifies signals.
- Hence, the hashing method must be the same (MiMC sponge)
- The initialisation strategy and leaf insertion strategy must be the same.
- The number of levels must be the same. This would be the a compile-time parameter in the client project. InterRep may be the primary determining factor here. The number of expected addresses in any particular group would be the key metric.
- Must allow a unique set of keys for each identity group.

See https://github.com/appliedzkp/semaphore/blob/master/contracts/sol/IncrementalMerkleTree.sol for solidity code managing Semaphore's merkle tree. 

## Database

The DB data structure aims to provide a means to efficiently retrieve a path given a leaf index, and to efficiently insert a new leaf or update an existing one. 

MongoDB allows data structures such as trees, and a '$graphLookup' aggregation function that traverses the tree structure.

Example data, including 2 leaf nodes and a 3-level tree (hashes are made up):
```
[{
  "_id": {
    "level": 0,
    "index": 1
  },
  "parent": {
    "level": 1,
    "index": 0
  },
  "hash": "78234762346"
},{
  "_id": {
    "level": 0,
    "index": 0
  },
  "parent": {
    "level": 1,
    "index": 0
  },
  "hash": "f7b823476234a6"
},{
  "_id": {
    "level": 1,
    "index": 0
  },
  "parent": {
    "level": 2,
    "index": 0
  },
  "hash": "6bc2a3f4267384"
},{
  "_id": {
    "level": 3,
    "index": 0
  },
  "hash": "8cd79234e78f97a89"
},{
  "_id": {
    "level": 2,
    "index": 0
  },
  "parent": {
    "level": 3,
    "index": 0
  },
  "hash": "7f82e9a3c47823a4"
}]
```


This aggregation retrieves the path for leaf node index 0:
```[
  {
    '$graphLookup': {
      'from': 'tree', 
      'startWith': {
        'level': 0, 
        'index': 0
      }, 
      'connectFromField': 'parent', 
      'connectToField': '_id', 
      'as': 'path', 
      'depthField': 'l'
    }
  }, {
    '$match': {
      '_id': {
        'level': 0, 
        'index': 0
      }
    }
  }, {
    '$project': {
      'path': 1, 
      '_id': 0
    }
  }, {
    '$unwind': {
      'path': '$path'
    }
  }
]```

The root hash would be the last element in the resulting path.

TODO: 
- Add groups
- The initial setting for the tree is hash(0) at level 0, then recursively hash that value for each level increment. We can store this in a data structure, or even in this structure as a slight variation on the usual document.
 