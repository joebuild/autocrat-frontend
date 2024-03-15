import React, { useEffect, useRef } from 'react'

const ParticleCanvas = (props) => {
    const canvasRef = useRef(null)
    const canvasBgRef = useRef(null)
    const cursorRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const cursor = cursorRef.current

        const ctx = canvas.getContext('2d')

        const dimensions = {
            width: 0,
            height: 0,
        }
        function updateWindowDimensions() {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            dimensions.width = window.innerWidth
            dimensions.height = window.innerHeight
        }
        updateWindowDimensions()
        let tiltX = 0,
            tiltY = 0,
            expectTiltX = 0,
            expectTiltY = 0
        function tilt(e) {
            let x = dimensions.width * 8 * (e.clientX / dimensions.width - 0.5)
            let y =
                dimensions.height * 8 * (e.clientY / dimensions.height - 0.5)
            tiltX += (x - tiltX) / 16
            tiltY += (y - tiltY) / 16
        }
        let cWidth, cHeight, starCounter
        starCounter = Math.floor(
            Math.sqrt(
                window.innerWidth * window.innerWidth +
                    window.innerHeight * window.innerHeight
            ) / 10
        )

        const starTypes = {
            near: {
                count: Math.floor(0.1 * starCounter),
                zMin: 10,
                zMax: 15,
                alpha: 0.8,
            },
            medium: {
                count: Math.floor(0.3 * starCounter),
                zMin: 18,
                zMax: 25,
                alpha: 0.7,
            },
            far: {
                count: Math.floor(0.6 * starCounter),
                zMin: 30,
                zMax: 50,
                alpha: 0.5,
            },
        }

        let star = {
            x: 0,
            y: 0,
            z: 0,
            velocityX: 0,
            velocityY: 0,
            velocityXMemo: 0,
            velocityYMemo: 0,
            radius: 0,
            elapsedLife: 0,
            life: 0,
            alpha: 0,
            isSwirling: false,
            swirlCount: 0,
            swirlMagnitude: 0,
            swirlIterate: 0,
            swirlDeltaDistanceX: 0,
            swirlDeltaDistanceY: 0,
            create: function (type) {
                let obj = Object.create(this)
                let coordinates = this.getCoordinates(obj, type)
                for (let prop in coordinates) {
                    obj[prop] = coordinates[prop] //set spawn coordinates
                }
                let otherProps = this.getOtherProps(obj, type)
                for (let prop in otherProps) {
                    obj[prop] = otherProps[prop]
                }
                return obj
            },
            getCoordinates: function (object, type) {
                let vect = {
                    x: Math.floor(
                        Math.random() * canvas.width * 0.8 + canvas.width * 0.1
                    ),
                    y: Math.floor(
                        Math.random() * canvas.height * 0.8 +
                            canvas.height * 0.1
                    ),
                    z:
                        Math.floor(Math.random() * starTypes[type].zMax * 100) /
                            100 +
                        starTypes[type].zMin,
                }
                return vect
            },
            getVelocity: function (object) {
                let num =
                    Math.floor((Math.random() - 0.5) * 500) / (2000 * object.z)
                while (num == 0) {
                    num = this.getVelocity(object)
                }
                if (num < 0) {
                    num -= 0.05 / object.z
                }
                if (num > 0) {
                    num += 0.05 / object.z
                }
                return num
            },
            getOtherProps: function (object, type) {
                let vect = {
                    velocityX: this.getVelocity(object),
                    velocityY: this.getVelocity(object),
                    velocityXMemo: this.velocityX,
                    velocityYMemo: this.velocityY,
                    radius: 25 / object.z,
                    elapsedLife: Math.floor(
                        ((Math.random() + 1) * 5 + 5) * 200 * (object.z / 4)
                    ),
                    life: Math.floor(
                        ((Math.random() + 1) * 5 + 5) * 200 * (object.z / 4)
                    ),
                    alpha: starTypes[type].alpha,
                    isNewBorn: false,
                }
                return vect
            },
        }
        let starArray = [],
            starGlowArray = []

        function init() {
            cWidth = canvas.width = window.innerWidth
            cHeight = canvas.height = window.innerHeight
            // ctxBg.fillRect(0, 0, cWidth, cHeight)
            // ctxBg.fillStyle = '#000' //pre-render bg
            for (let prop in starTypes) {
                // stars
                for (let i = 0; i < starTypes[prop].count; i++) {
                    let stars = star.create(prop)
                    starArray.push(stars)
                }
            }
            requestAnimationFrame(update)
        }
        function drawStar(star) {
            ctx.beginPath()
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2, true)
            ctx.fillStyle = `rgba(255,255,255,${star.alpha})`
            ctx.fill()
        }

        // --- events --- //

        window.onresize = function () {
            cWidth = canvas.width = window.innerWidth
            cHeight = canvas.height = window.innerHeight
            updateWindowDimensions()
            attributes = cursor.getBoundingClientRect()
        }
        const cursorAttributes = {
            width: 0,
            x: 0,
            y: 0,
            radius: 0,
        }
        let attributes = cursor.getBoundingClientRect(),
            cursorVelocity,
            x0 = 0,
            x1 = 0,
            y0 = 0,
            y1 = 0,
            coBool,
            disableInput = true,
            timeoutInput

        // -- update -- //
        let t0 = 0,
            t1 = 0,
            targetFPS = 'max',
            interval,
            prevStart = 0,
            nowStart = 0,
            deltaTime,
            calcFPSInt
        function newBornStar(star) {
            star.velocityX = star.getVelocity(star)
            star.velocityY = star.getVelocity(star)
            star.velocityXMemo = star.velocityX
            star.velocityYMemo = star.velocityY
            star.x = Math.floor(
                Math.random() * canvas.width * 0.8 + canvas.width * 0.1
            )
            star.y = Math.floor(
                Math.random() * canvas.height * 0.8 + canvas.height * 0.1
            )
            star.elapsedLife = 0
            star.life = Math.floor(
                ((Math.random() + 1) * 5 + 5) * 200 * (star.z / 4)
            )
            star.isNewBorn = true
            star.isSwirling = false
            star.swirlCount = 0
            star.swirlIterate = 0
            star.swirlMagnitude = 0
            star.swirlDeltaDistanceX = 0
            star.swirlDeltaDistanceY = 0
        }

        function update(timestamp) {
            prevStart = nowStart = timestamp
            while (nowStart - prevStart < interval) {
                nowStart = performance.now()
            }
            if (t0 <= t1) {
                t0 = nowStart
            } else if (t0 > t1) {
                t1 = nowStart
            }
            if (disableInput == false) {
                if (coBool == true) {
                    x1 = cursorAttributes.x
                    y1 = cursorAttributes.y
                    coBool = false
                } else {
                    x0 = cursorAttributes.x
                    y0 = cursorAttributes.y
                    coBool = true
                }
                cursorVelocity = Math.sqrt(
                    (x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1)
                )
            }
            deltaTime = Math.abs(t1 - t0)
            // -- graphics paint -- //
            ctx.clearRect(0, 0, cWidth, cHeight)
            for (let i = 0; i < starArray.length; i++) {
                let star = starArray[i]
                //swirl
                swirlDust(star, cursorVelocity)
                if (star.isSwirling == true) {
                    if (star.swirlIterate > 0) {
                        if (star.isNewBorn == true) {
                            star.elapsedLife += star.swirlMagnitude * 40
                        } else {
                            star.elapsedLife -= star.swirlMagnitude * 40
                        }
                        let rads
                        if (Math.abs(star.atan2Value) < 90) {
                            rads =
                                (-(star.atan2Value + star.swirlIterate) *
                                    Math.PI) /
                                360
                        } else {
                            rads =
                                ((star.atan2Value + star.swirlIterate) *
                                    Math.PI) /
                                360
                        }
                        star.velocityX =
                            ((star.velocityXMemo +
                                (Math.cos(rads) / 5) *
                                    star.swirlMagnitude *
                                    1.2) *
                                5) /
                                star.z +
                            star.swirlDeltaDistanceX / 300
                        star.velocityY =
                            ((star.velocityYMemo +
                                (Math.sin(rads) / 5) *
                                    star.swirlMagnitude *
                                    1.2) *
                                5) /
                                star.z +
                            star.swirlDeltaDistanceY / 300
                        star.swirlIterate -=
                            0.5 +
                            Math.random() * 1 * deltaTime +
                            (((star.swirlIterate * 8) / star.swirlCount) *
                                star.swirlMagnitude) /
                                2
                    } else {
                        star.isSwirling = false
                        star.swirlCount = 0
                    }
                }
                if (star.isSwirling == false) {
                    if (
                        Math.abs(star.velocityX / star.velocityXMemo) > 1.1 ||
                        Math.abs(star.velocityY / star.velocityYMemo) > 1.1
                    ) {
                        if (
                            Math.abs(star.velocityX / star.velocityXMemo) > 1.1
                        ) {
                            star.velocityX *=
                                1 -
                                ((0.01 * (star.swirlMagnitude + 0.2)) / 2) *
                                    (deltaTime / 6)
                        }
                        if (
                            Math.abs(star.velocityY / star.velocityYMemo) > 1.1
                        ) {
                            star.velocityY *=
                                1 -
                                ((0.01 * (star.swirlMagnitude + 0.2)) / 2) *
                                    (deltaTime / 6)
                        }
                    }
                }
                // end of swirl
                if (
                    star.x > canvas.width * 1.2 ||
                    star.y > canvas.height * 1.2 ||
                    star.x < 0 - canvas.width * 0.2 ||
                    star.y < 0 - canvas.width * 0.2
                ) {
                    newBornStar(star)
                }
                star.x += star.velocityX * deltaTime
                star.y += star.velocityY * deltaTime
                if (star.elapsedLife + deltaTime > star.life) {
                    if (star.isNewBorn == true) {
                        star.elapsedLife = 0
                        star.isNewBorn = false
                    } else {
                        newBornStar(star)
                    }
                }
                star.elapsedLife += deltaTime
                if (star.isNewBorn == true) {
                    star.alpha = star.elapsedLife / star.life
                } else {
                    star.alpha = 1 - star.elapsedLife / star.life
                }
                star.x += tiltX / (star.z * star.z)
                star.y += tiltY / (star.z * star.z)
                drawStar(star)
                star.x -= tiltX / (star.z * star.z)
                star.y -= tiltY / (star.z * star.z)
            }
            requestAnimationFrame(update)
        }
        function swirlDust(star, cursorVelocity) {
            let x = star.x - cursorAttributes.x,
                y = star.y - cursorAttributes.y,
                r = star.radius + cursorAttributes.radius
            if (r * 2 > Math.sqrt(x * x + y * y)) {
                star.atan2Value =
                    (Math.atan2(-star.velocityY, star.velocityX) * 180) /
                    Math.PI
                if (cursorVelocity >= 2 && cursorVelocity < 100) {
                    if (star.isSwirling == false) {
                        star.isSwirling = true
                        star.swirlMagnitude = cursorVelocity / 10
                        star.swirlCount = Math.floor(
                            ((Math.random() * 300 + 180) *
                                (star.swirlMagnitude + 1)) /
                                2
                        )
                        star.swirlIterate = star.swirlCount
                        star.swirlDeltaDistanceX = x
                        star.swirlDeltaDistanceY = y
                    }
                }
            }
        }

        init()
        return () => {
            window.removeEventListener('resize', updateWindowDimensions)
        }
    }, [])

    return (
        <>
            <canvas id="canvas-main" className="" ref={canvasRef} />
            <div ref={cursorRef} className="z-50" />
            <div className="absolute top-0 left-0 right-0 bottom-0 overflow-scroll">
                {props.children}
            </div>
        </>
    )
}

export default ParticleCanvas
