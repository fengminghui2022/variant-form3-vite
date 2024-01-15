import { Get,Post } from "../server"

export function getSelectSourceOptions() {
    return Get('/qms/flowable/widget/list')
}

export default {
	getSelectSourceOptions,
}
