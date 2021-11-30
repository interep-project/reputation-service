import config from "src/config"

export default function createMagicLink(email: string, verificationToken: String, groupId: String[]) {
    let group_string = groupId[0]

    for (let i = 1; i < groupId.length; i++) {
        group_string = `${group_string}+${groupId[i]}`
    }

    const link = `${config.NEXTAUTH_URL}/groups/email/${verificationToken}/${email}/${group_string}`

    return link
}
