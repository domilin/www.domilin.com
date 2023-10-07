import React from 'react'
import { SimpleImg } from 'react-simple-img'
import { staticDomain } from '../../../config/config'

export default ({ icon }) => <SimpleImg
    applyAspectRatio
    width={86}
    height={86}
    className="icon-lazy-load"
    placeholder={'hsla(0, 0%, 100%, 0.08)'}
    src={`${staticDomain}${icon}`}
    alt={name}
/>
