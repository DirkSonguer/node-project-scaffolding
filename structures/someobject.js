// Reference object.
function SomeObject() {
    this.ObjectType = "SomeObject";

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
    Object: SomeObject,
    MoreContnent: "Additional content if required"
};