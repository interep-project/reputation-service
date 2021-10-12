import {
  BigInt,
  log
} from "@graphprotocol/graph-ts";

import {
  NewRootHash as NewRootHashEvent,
} from "../init/InterRepGroups/generated/InterRepGroups/InterRepGroups"

import { Member, Group } from "../init/InterRepGroups/generated/schema"

const BIG_INT_ONE = BigInt.fromI32(1)

export function handleNewRootHash(event: NewRootHashEvent): void {
  log.debug(`handleNewRootHash: block {}`, [event.block.number.toString()])
  let entity = new Member(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )

  log.info('getting group {}', [event.params.groupId.toHexString()])
  let group = getGroup(event.params.groupId.toHexString())
  log.info('got group {}', [group.id])
  group.memberCount = group.memberCount.plus(BIG_INT_ONE)
  group.leafCount = group.leafCount.plus(BIG_INT_ONE)

  entity.group = group.id
  entity.identityCommitment = event.params.identityCommitment.toHexString()
  entity.rootHash = event.params.rootHash.toHexString()
  entity.leafIndex = group.leafCount
  entity.save()

  group.save()
  log.debug('end {}', [group.leafCount.toString()])
  
}


function getGroup(groupId: string): Group {
  let group = Group.load(groupId)
  if (group == null) {
    group = new Group(groupId)
    group.save()
  }
  return group
}
