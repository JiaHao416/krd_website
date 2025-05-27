const Footer = () => {
  return (
    <footer className="mt-auto bg-black/20 backdrop-blur-sm border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* 分隔線 */}
        <div className="h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent mb-8"></div>

        {/* 聯絡我們標題 */}
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
            聯絡我們
          </h3>
          <p className="text-gray-400">專業音響設備供應，竭誠為您服務</p>
        </div>

        {/* 聯絡資訊 */}
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {/* 地址 */}
          <div className="space-y-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-1">地址</h4>
              <p className="text-gray-300 text-sm">
                411 台中市太平區永平路二段320之1號
              </p>
            </div>
          </div>

          {/* 電話 */}
          <div className="space-y-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-1">電話</h4>
              <p className="text-gray-300 text-sm">(04) 22798787</p>
            </div>
          </div>

          {/* 服務時間 */}
          <div className="space-y-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-1">服務時間</h4>
              <p className="text-gray-300 text-sm">
                09:00 AM ~ 17:30 PM
                <br />
                <span className="text-gray-400 text-xs">(例、假日休息)</span>
              </p>
            </div>
          </div>
        </div>

        {/* 底部版權 */}
        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 羽程企業社 KRD MICGO. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
