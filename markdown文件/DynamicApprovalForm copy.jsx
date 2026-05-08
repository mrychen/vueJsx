import { ref } from 'vue';

export function useChangeForm() {
  const formRef = ref(null);

  const formItemRender = ({ formCol, form }, contentRenderer) => (
    <van-field
      v-model={form[formCol.prop]}
      autosize
      type={formCol.type || 'text'}
      maxlength={formCol.maxlength ?? 255}
      placeholder={formCol.placeholder || '请输入'}
      name={formCol.prop}
      rules={formCol.rules}
      required={formCol.required}
      label={formCol.label}
      showWordLimit={formCol.showWordLimit}
      class={formCol.class || ''}
      {...(contentRenderer && {
        input: () => contentRenderer(formCol, form),
      })}
    />
  );

  const columns = {
    common: {
      formCol: [
        {
          prop: 'approvalRemark',
          type: 'textarea',
          label: '审批意见：',
          maxlength: 255,
          showWordLimit: true,
          placeholder: '请输入审批意见',
          required: true,
          rules: [{ required: true, message: '请输入审批意见' }],
          contentRenderer: (formCol, form) => (
            <div class="custom-input-slot">
              <span>{formCol.hint || '可输入审批意见，最多255字'}</span>
              <van-button
                size="small"
                type="primary"
                onClick={() => {
                  form[formCol.prop] = '自动填充默认审批意见';
                }}
              >
                一键填充
              </van-button>
            </div>
          ),
          renderer: ({ formCol, form }) =>
            formItemRender({ formCol, form }, formCol.contentRenderer),
        },
      ],
    },
    contracts: {
      formCol: [
        {
          title: '基础金额信息',
          col: [
            {
              prop: 'approvedAmount',
              type: 'number',
              label: '审定金额：',
              required: true,
              maxlength: 16,
              rules: [
                { required: true, message: '审定金额不能为空' },
                {
                  validator: (value) => {
                    if (!value) return true;
                    return /^\d{1,9}(\.\d{1,6})?$/.test(value);
                  },
                  message: '整数最多9位，小数最多6位',
                },
              ],
              renderer: ({ formCol, form }) => formItemRender({ formCol, form }),
            },
          ],
        },
      ],
    },
  };

  const renderForm = {
    common: ({ reportForm }) => (
      <>
        {columns.common.formCol.map((item) =>
          item.renderer({ formCol: item, form: reportForm }),
        )}
      </>
    ),
    contracts: ({ reportForm }) => (
      <>
        {columns.contracts.formCol.map((section) => (
          <>
            {section.title && <div class="titleTip">{section.title}</div>}
            {section.col.map((item) =>
              item.renderer({ formCol: item, form: reportForm }),
            )}
          </>
        ))}
      </>
    ),
  };

  return {
    formRef,
    renderForm,
  };
}