
export function setStorage(key, data) {
	if (!Array.isArray(data)) {
		return false
	} else {
		let formatData = []
		for (let i = 0; i < data.length; i++) {
			const element = data[i]
			formatData.push(JSON.stringify(element))
		}
		localStorage.setItem(key, JSON.stringify(formatData))
	}
}


export function getStorage(key) {
	let rawData = JSON.parse(localStorage.getItem(key))
	if (!rawData || !Array.isArray(rawData)) {
		return false
	} else {
		let data = []
		for (let i = 0; i < rawData.length; i++) {
			const element = rawData[i]
			data.push(JSON.parse(element))
		}
		return data
	}
}



export function removeStorageItem(key){
	window.localStorage.removeItem(key)
}

