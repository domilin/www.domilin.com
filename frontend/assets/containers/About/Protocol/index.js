import React from 'react'
import BlockOnPopup from '../../../components/BlockOnPopup'
import './index.scss'

export default ({ style }) => {
    return <div className="more-content" style={{ ...style }}>
        <div className="protocol-wrapper">
            <BlockOnPopup>
                <h2>使用条款</h2>
                <p>重要提示:在使用本软件(DOMILIN)之前，请仔细阅读本协议，其中包含您获得DOMILIN使用许可的条款和条件。如果您不接受本协议的条款和条件，请不要使用DOMILIN。如果您访问或使用DOMILIN，您将接受本协议的条款和条件以及DOMILIN的隐私政策。版权受版权法和国际版权条约以及其他知识产权法的保护。</p>
                <p>如果您是您所代表的其他实体的代理人或雇员，并保证 （i） 接受本协议的个人被正式授权代表该实体接受本协议并约束此类实体，以及 （ii） 此类实体拥有充分的权力（公司或其他）签署本协议并在此下履行其义务。</p>
                <h3>1. 定义</h3>
                <ul>
                    <li>（i） "用户"或"您"指 DOMILIN 为使用本软件而向其授予许可证的个人或业务实体;</li>
                    <li>（ii） "生效日期"是指用户首次通过DOMILIN网站或通过第三方应用程序、扩展程序或附加商店（如Chrome网上商店或Firefox附加组件网站）安装许可软件的日期;</li>
                    <li>（iii） "许可软件"是指称为DOMILIN的基于网络的软件扩展，该扩展是DOMILIN专有的;</li>
                    <li>（四） "被许可人数据"是指用户向本处提交的所有电子数据或信息;</li>
                    <li>（五） "服务"是指为传输被许可人数据而提供对许可软件的访问;</li>
                    <li>（六） "使用数据"是指收集的有关用户使用服务的数据。例如，用户访问"要执行"列表或他们喜爱的照片的频繁进行。</li>
                </ul>

                <h3>2. 许可证和数据</h3>
                <h4>2.1 软件许可证授予</h4>
                <p>在遵守本协议的所有条款和条件以及支付任何适用费用的情况下，DOMILIN 授予用户免费、非排他性、不可转让的许可，以下载、安装和使用许可软件作为服务的一部分。</p>

                <h4>2.2 被许可人数据许可证</h4>
                <p>用户向 DOMILIN 授予非排他性许可，以便根据需要访问和修改被许可人数据，以便提供服务。</p>

                <h4>2.3 使用数据</h4>
                <p>用户同意DOMILIN有权根据当前生效的隐私政策收集使用情况数据，并据此创建统计数据和分析（"派生数据"）。</p>

                <h4>2.4 16岁以下儿童的同意</h4>
                <p>通过使用我们的服务，您声明并保证您至少 16 岁。除以下规定外，16岁以下者不得使用该服务。</p>
                <p>DOMILIN 不针对儿童，我们希望儿童的任何使用只有在其父母、监护人和/或经授权的学校官员的指导、监督和同意下才能进行。如果您未满 16 岁，您必须获得家长、监护人和/或授权学校官员的同意才能使用服务。DOMILIN 依靠父母和监护人确保未成年人只有在能够理解本服务条款和隐私政策中规定的权利和责任时才使用DOMILIN。</p>
                <p>希望未满 16 岁的学生创建 DOMILIN 帐户，则您有责任遵守《中国未成年人保护法》政策。这意味着您必须将 DOMILIN 将收集的个人身份信息通知学生的父母/监护人，并且您将在学生建立帐户或使用 DOMILIN 之前获得家长/监护人的同意。获得此类同意后，您必须向其父母或监护人提供我们的隐私政策副本，并存档所有同意书，并应要求向我们提供。</p>
                <p>如果我们发现未满 16 岁的儿童在未经家长、监护人和/或经授权学校官员同意的情况下向我们提供了个人信息，我们将删除该儿童的帐户和信息。如果您知道未满 16 岁以下的儿童在未经家长、监护人和/或授权学校官员同意的情况下向 DOMILIN 提供了个人信息，请联系 DOMILIN 支持。</p>

                <h3>3. 技术支持</h3>
                <p>3.1DOMILIN 在商业上做出合理的努力，通过直接联系我们，domilin@qq.com。</p>

                <h3>4. 免责保证</h3>
                <p>4.1在法律允许的最大范围内，DOMILIN 提供的许可软件和技术支持在"原样"的基础上提供。法规、法律运作、交易过程、贸易使用或其他方面，或 DOMILIN 提供的任何其他产品或服务，明示或暗示、书面或口头，不产生任何保证、陈述或条件。DOMILIN 不提供任何隐含的保证或质量、可商户性、可商家质量、耐用性、特定用途的适用性以及不侵权的保证或条件。DOMILIN 不声明或保证软件应满足用户的任何或所有特定要求，软件将无差错或不间断地运行，也不保证可以发现或纠正软件中的所有错误或缺陷。</p>
                <p>4.2在某些司法管辖区，本节中的某些或所有条款可能无效，或者适用法律可能要求提供更广泛的担保，在这种情况下，适用法律将优先于本协议。</p>

                <h3>5. 责任限制</h3>
                <p>5.1在适用法律允许的最大范围内，DOMILIN 在任何情况下均不得对用户或任何其他直接人员负责， 间接、附带、特殊、惩罚性、惩戒性或后果性的任何损害，包括但不限于法律费用、业务损失、利润损失、收入损失、数据丢失或损坏、计算机时间损失、替代货物或服务成本，或未能实现预期节约或因本协议或与本协议相关的任何其他商业或经济损失，即使DOMILIN已被告知此类损失或损害的可能性，或此类损失或损害是可预见的。</p>
                <p>5.2DOMILIN 的全部责任以及用户对软件和技术支持的专属补救措施。DOMILIN 为因任何原因而为任何原因而提供的任何其他产品或服务，无论诉讼原因如何，无论是合同还是侵权，包括根本违约或疏忽，将总量限于用户根据本协议向 DOMILIN 支付的因引起索赔的软件、技术支持或服务而支付的金额。</p>
                <p>5.3声明、保证和条件以及责任限制的免责声明是本协议的重要组成部分。您承认，对于声明、保证、条件以及责任限制的免责声明，DOMILIN 及其任何许可方或供应商都不得授予本协议所授予的权利。</p>

                <h3>6. 所有权</h3>
                <p>6.1用户承认并同意许可软件包含属于DOMILIN及其许可方的机密和专有信息及商业机密。用户承认并同意本软件的产权和权利完全由DOMILIN及其许可方决定。用户对本软件的权利严格限于本协议中授予的权利。用户不得对本软件进行反编译、拆解或以其他方式逆向工程。如果适用法律禁止上述规定，用户将提前向 DOMILIN 发出书面通知：（a） 其意图对软件进行反编译、拆解或以其他方式逆向工程，以及 （b） 相关工作的性质。DOMILIN 将有权首先拒绝以现行费率和价格执行此类工作。</p>

                <h3>7. 期限和终止</h3>
                <p>7.1本协议的期限将从生效之日起生效，只要用户根据订阅使用服务并支付所有适用费用，本协议的期限将一直持续，除非根据本协议第 8 条提前终止。</p>
                <p>7.2如果用户在通知用户后三十 （30） 天内未纠正此类违反行为，DOMILIN 可终止本协议。本协议的终止不会使用户有权退还用户向 DOMILIN 支付的任何金额，或影响用户可能必须支付任何未支付的 DOMILIN 债务。</p>
                <p>7.3在本协议终止或到期时，用户的使用和访问服务的权利将立即终止。本协议的第 1、4、5、6、7和8.3节应在本协议到期或终止后使用。</p>

                <h3>8. 一般规定</h3>
                <h4>8.1 无豁免</h4>
                <p>在根据本协议行使任何权利的任何延迟或失败，或任何部分或单一行使任何权利时，均不构成放弃该权利或本协议规定的任何其他权利。任何对违反本协议中任何明示或暗示条款的同意均不构成对随后任何违反行为的同意，无论是同一条款还是任何其他条款。</p>
                <h4>8.2 可分割性</h4>
                <p>如果本协议的任何条款不可执行或变得不可执行，则本协议将被切断，本协议的其余部分将保持完全有效。</p>
                <h4>8.3 分配</h4>
                <p>未经DOMILIN事先书面同意，用户不得转让或转让本协议（无论是自愿的、依法运作的还是以其他方式的）。DOMILIN 可随时转让本协议，恕不另行通知。本协议对双方及其各自的继承人和受人允许的受让人均具有约束力，并将受益。</p>
                <h4>8.4 整个协议</h4>
                <p>本协议是用户和DOMILIN之间就本协议的主题达成的全部谅解和协议，它取代所有先前的谈判、承诺和理解、口头或书面、用户发布的任何采购订单。</p>

                <p>如果您对本协议有任何疑问，请通过domilin@qq.com联系我们。</p>
            </BlockOnPopup>
        </div>
    </div>
}
