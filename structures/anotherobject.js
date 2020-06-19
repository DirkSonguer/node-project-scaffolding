// Reference object.
function AnotherObject() {
    this.ObjectType = "AnotherObject";

    // UUID.
    this.id = "";

    // Name as human readable string.
    this.name = "";

    // Description as string.
    this.description = "";

    // URL to the content.
    this.url = "";
}

module.exports = {
    Object: AnotherObject,
    MoreContnent: "Additional content if required"
};