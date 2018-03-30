/*
    Created by hity on 06/08/17
    参数说明：
        auto: 是否自执行
        imgs: 需预加载的图片列表，为二维表
        ignore：在自执行过程中，需要跳过的图片set 脚标
        firstSetReady: 第一组图片完成加载以后，置为true，便于外部掌握状态
    说明：
        非自执行的需求，可直接调用loadOneSetImages方法，返回值为promise
*/
import async from 'async'

class Preload {
    constructor(auto, imgs = [], ignore = []) {
        this.imgs = imgs
        this.ignore = ignore
        this.auto = auto
        this.firstSetReady = false
        this.finished = false
        this.init()
    }
    init() {
        if (this.auto) {
            this.autoExeImageStream()
        }
    }

    autoExeImageStream() {
        let seriesObj = []
        this.imgs.forEach((item, index) => {
            if (this.ignore.indexOf(index) != -1) {
                return
            }
            seriesObj.push((done) => {
                this.loadOneSetImages(item).then(() => {
                    done(null, index)
                })
            })
        })

        async.series(seriesObj, (error, result) => {
            console.log('资源加载完成～', result)
        })
    }
    loadOneSetImages(imgList, i) {
        let promiseList = []

        imgList.forEach((item, index) => {
            promiseList.push(this.loadSingleImage(item))
        })
        return Promise.all(promiseList).then((data) => {
            console.log('资源加载-1', data)
            this.firstSetReady = true
        }).catch(function() {
            this.firstSetReady = true
        })
    }
    loadSingleImage(src) {
        if (!src) {
            return new Promise((resolve, reject) => {
                resolve('noImage')
            })
        }
        let newImg = new Image()
        newImg.src = src
        return new Promise((resolve, reject) => {
            newImg.onload = () => {
                resolve('success')
            }
            newImg.onerror = () => {
                resolve('fail')
            }
        })
    }
}

export default Preload
