import React from 'react'
import {Link} from 'react-router-dom'
import {Zone} from './Tools.js'
import './App.css'

function Privacy(props) {
    return (
        <section id="privacy">
            <Zone>
                <div style={{padding: "32px"}}>
                    <h1>Privacy Policy</h1>
                    <p>I operate this site 'Facebook Messenger Counter', to provide the service of generating graphs and statistics for a user's message hsitory</p>
                    <p>This page aims to inform users regarding the policy of use, collection, and disclosure of personal information if anyone decides to use the site 'Facebook Messenger Counter'.
                    If you choose to use this service, then you agree to our collection and use of information. We will not use or share your information with anyone except as described in this Privacy Policy</p>
                    <h3>Information Collection and Use</h3>
                    <p>To provide our service we require users to upload information with personally identifiable information. This information may include, but is not limited to, names, phone numbers, and postal addresses. The information you provide will be used solely for the services provided on this site</p>
                    <p>At this time, we do not permanently record any data or information outside of your environment. Neither does this domain store any Cookies, commonly used to identify users and store information on your computer's hard drive.</p>
                    <h3>Security</h3>
                    <p>We understand that you need to trust us when providing personal information required to use our service. We strive to use acceptable means of protecting your data. Remember no method of information transmission over the internet or electronic storage is perfectly secure and reliable.
                    We cannot guarantee absolute safety of your data. Remember to take precaution when sharing personal information with any electronic service</p>
                    <p>As a measure to protect your data, we do not currently transmit any of your information over the internet or store it on your computer in the form of cookies. If you're still concerned about security vulnerabilities this site can be used offline once all assets are loaded.</p>
                    <h3>Links to Other Sites</h3>
                    <p>Our service may contain links to other sites. If you click on a third party link, you will be directed to that site. Note that these external sites are not operated by us. Therefore, we advise you to review the privacy policy of these websites</p>
                    <h3>Changes to This Privacy Policy</h3>
                    <p>We may update our privacy policy from time to time. Thus, we advise you review this page periodically for any changes. Any changes made are effective immediately, after they are posted to this page.</p>
                    <h3>&nbsp;</h3>
                    <Link to="/">Return to app</Link>
                </div>
            </Zone>
            <main>{props.children}</main>
        </section>
    )
}

export default Privacy
