import { message } from 'antd';
const SUCCESS_DURATION = 1;
const ERROR_DURATION = 3;
const INFO_DURATION = 1;
const WARNING_DURATION = 2;

const ZkToast = {
    success: function() {
        var content = arguments[0];
        if (!content) {
            return
        }
        var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : SUCCESS_DURATION;
        var onClose = arguments.length > 2 && typeof arguments[2] == 'function' ? arguments[2] : function() {};
        // var mask = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
        return message.success(content, duration, onClose);
    },
    error: function() {
        var content = arguments[0];
        if (!content) {
            return
        }
        var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ERROR_DURATION;
        var onClose = arguments.length > 2 && typeof arguments[2] == 'function' ? arguments[2] : function() {};
        // var mask = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
        return message.error(content, duration, onClose);
    },
    info: function() {
        var content = arguments[0];
        if (!content) {
            return
        }
        var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : INFO_DURATION;
        var onClose = arguments.length > 2 && typeof arguments[2] == 'function' ? arguments[2] : function() {};
        // var mask = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
        return message.info(content, duration, onClose);
    },
    warning: function() {
        var content = arguments[0];
        if (!content) {
            return
        }
        var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : WARNING_DURATION;
        var onClose = arguments.length > 2 && typeof arguments[2] == 'function' ? arguments[2] : function() {};
        // var mask = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
        return message.warning(content, duration, onClose);
    },
    warn: function() {
        var content = arguments[0];
        if (!content) {
            return
        }
        var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : WARNING_DURATION;
        var onClose = arguments.length > 2 && typeof arguments[2] == 'function' ? arguments[2] : function() {};
        // var mask = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
        return message.warn(content, duration, onClose);
    },
    loading: function() {

    }
}

export { ZkToast };
