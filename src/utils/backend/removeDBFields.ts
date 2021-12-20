export default function removeDBFields(document: any) {
    delete document._id
    delete document.__v

    return document
}
