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
  log.debug(`handleNewRootHash`, [])
  let entity = new Member(
    event.transaction.hash.toHex() + "-" + event.logIndex.toString()
  )
  log.debug('getting group {}', [event.params.groupId])
  let group = getGroup(event.params.groupId)
  log.debug('got group {}', [group.id])
  group.memberCount.plus((BIG_INT_ONE))
  group.leafCount.plus(BIG_INT_ONE)

  entity.group = group.id
  entity.identityCommitment = event.params.identityCommitment
  entity.rootHash = event.params.rootHash
  entity.index = group.leafCount
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
