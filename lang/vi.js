export const transValidation = {
    email_incorrect: "Email phải có dạng example@xxx.xxx",
    gender_incorrect: "Không được để trống giới tính",
    password_incorrect: "Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
    password_confirm_incorrect: "Mật khẩu xác nhận chưa chính xác"
};

export const transErrors = {
    account_in_use: "Email này đã được sử dụng",
    account_removed: "Tài khoản này đã bị gỡ khỏi hệ thống, vui lòng liên hệ bô phận hỗ trợ",
    account_not_active: "Tài khoản chưa kích hoạt email",
    token_undefined: "Token không tồn tại",
    login_failed: "Sai tài khoản hoặc mật khẩu",
    server_error: "Có lỗi phía hệ thống, vui lòng liên hệ bộ phận hỗ trợ",
    avatar_type: "Kiểu file không hợp lệ, chỉ chấp nhận jpg & png",
    avatar_size: "Ảnh upload tối đa 1MB"
};

export const transSuccess = {
    userCreated: (userEmail) => {
        return `Tài khoản <strong>${userEmail}</strong> đã được tạo, vui lòng kiểm tra email để kích hoạt tài khoản`
    },
    account_actived: "Kích hoạt tài khoản thành công. Vui lòng đăng nhập.",
    loginSuccess: (username) => {
        return `Xin chào ${username}`;
    },
    logout_success: "Đăng xuất tài khoản thành công",
    avatar_updated: "Cập nhật ảnh đại diện thành công"
};

export const transMail = {
    subject: "Real talk: Xác nhận kích hoạt tài khoản",
    template: (linkVerify) => {
        return `
            <h2>Bạn nhận được email này vì đã đăng ký tài khoản trên ứng dụng Realk Talk</h2>
            <h3>Vui lòng click vào liên kết bên dưới để xác nhận tài khoản</h3>
            <h3><a href="${linkVerify}" target="blank">${linkVerify}</a></h3>
            <h4>Nếu tin rằng email này là nhầm lẫn, xin hãy bỏ qua</h4>
        `;
    },
    send_failed: "Có lỗi trong quá trình gửi mail, vui lòng liên lạc bộ phận hỗ trợ"
};