//常量与客户端共享
//成员类型
export enum MemberType {
    owner,//群主
    normal//普通成员
}

export enum MemberStatus {
    normal
}

//好友邀请
export enum FriendRequest {
    agree,//接受
    reject,//拒绝
}

//好友邀请
export enum FriendRequestStatue {
    PADDING,//赘语
    AGREE,//拒绝
    REJECT,//拒绝
    IGNORE,//拒绝
}