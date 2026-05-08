// src/DynamicApprovalForm.jsx
import { defineComponent, reactive, ref } from 'vue';
import { useChangeForm } from './useChangeForm';

export default defineComponent({
  name: 'DynamicApprovalForm',
  setup() {
    const { formRef, renderForm } = useChangeForm();

    const reportForm = reactive({
      approvalRemark: '',
      approvedAmount: '',
    });

    const isContract = ref('1');

    const handleSubmit = () => {
      formRef.value?.validate().then(() => {
        console.log('提交数据：', reportForm);
      });
    };

    return () => (
      <div class="form-container">
        <van-form ref={formRef}>
          <component
            is={isContract.value === '1' ? renderForm.contracts : renderForm.common}
            reportForm={reportForm}
          />
        </van-form>

        <div class="button-group">
          <van-button type="primary" onClick={handleSubmit}>
            提交
          </van-button>
          <van-button
            type="default"
            onClick={() => {
              isContract.value = isContract.value === '1' ? '2' : '1';
            }}
          >
            切换场景
          </van-button>
        </div>
      </div>
    );
  },
});