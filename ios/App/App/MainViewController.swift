import UIKit
import Capacitor

class MainViewController: CAPBridgeViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        disableBounce()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        disableBounce()
    }

    private func disableBounce() {
        print("⚡️ disableBounce — webView: \(String(describing: webView))")
        webView?.scrollView.bounces = false
        webView?.scrollView.alwaysBounceVertical = false
        webView?.scrollView.alwaysBounceHorizontal = false
        print("⚡️ bounces after set: \(webView?.scrollView.bounces ?? true)")
    }
}
