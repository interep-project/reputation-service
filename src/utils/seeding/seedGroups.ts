import Group from "src/models/groups/Group.model";
import colors from "colors";

export default async function seedGroups(
  groups: any[],
  logger = false
): Promise<void> {
  const log = logger ? console.log : (message: string) => message;

  log(colors.white.bold("\nSeeding groups...\n"));

  for (const group of groups) {
    let groupDocument = await Group.findByGroupId(group.groupId);

    if (groupDocument) {
      log(
        colors.white(`Document with id: ${groupDocument.id} already inserted`)
      );
    } else {
      groupDocument = await Group.create(group);

      await groupDocument.save();

      log(colors.white(`Document with id: ${groupDocument.id} inserted`));
    }
  }

  log(colors.green.bold("\nDocuments inserted correctly ✓\n"));
}
