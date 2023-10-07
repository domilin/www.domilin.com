import React from 'react'
import BlockOnPopup from '../../../components/BlockOnPopup'
import './index.scss'
import qqGroup from './images/qq-group.jpg'
import wechatPay from './images/wechat-pay.jpg'

export default ({ style }) => {
    return <div className="more-content" style={{ ...style }}>
        <div className="contact-wrapper">
            <BlockOnPopup>
                <h2>技术支持</h2>
                <p>domilin@qq.com</p>

                <h2>商务合作</h2>
                <p>domilin@qq.com</p>

                <h2>官方QQ交流群</h2>
                <p><img src={qqGroup} alt="QQ官方交流群"/></p>

                <h2>友情赞助</h2>
                <h3>非常感谢您的支持，还请备注用户名、留言等信息</h3>
                <p><img src={wechatPay} alt="微信支付"/></p>

                <h2>感谢名单</h2>
                <h3>诚挚感谢以下赞助用户(以时间排名)</h3>
                <table>
                    <thead>
                        <tr>
                            <th>名称</th>
                            <td>时间</td>
                            <td>金额</td>
                            <td>备注</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <th>P*B</th>
                            <td>2021-04-28 14:09:07</td>
                            <td>10￥</td>
                            <td></td>
                        </tr>
                        <tr>
                            <th>*鸿</th>
                            <td>2021-07-26 20:43:39</td>
                            <td>6￥</td>
                            <td>好东西，加油</td>
                        </tr>
                        <tr>
                            <th>*水</th>
                            <td>2021-10-231 23:27:47</td>
                            <td>10￥</td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </BlockOnPopup>
        </div>
    </div>
}
