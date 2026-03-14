import pandas as pd
import datetime
import os

# 1. 使用绝对路径确保脚本能找到文件 (Using absolute path)
file_path = '/Users/sweetpaper/Documents/GitHub/Michelle_Lin-Projects/profolio/IceProject/greenland_mass_200204_202505.txt'

if not os.path.exists(file_path):
    print(f"❌ 错误：在路径 {file_path} 找不到文件！请检查文件名是否正确。")
else:
    skip_rows = 0
    with open(file_path, 'r') as f:
        lines = f.readlines()
        for i, line in enumerate(lines):
            if 'Header_End' in line:
                skip_rows = i + 1
                break

    # 2. 修正 SyntaxWarning，使用 r 前缀处理转义字符
    df = pd.read_csv(file_path, skiprows=skip_rows, sep=r'\s+', names=['Decimal_Year', 'Mass_Gt', 'Uncertainty_Gt'])

    # 3. 转换日期
    def decimal_to_date(decimal):
        year = int(decimal)
        remainder = decimal - year
        boy = datetime.datetime(year, 1, 1)
        eoy = datetime.datetime(year + 1, 1, 1)
        seconds = remainder * (eoy - boy).total_seconds()
        return (boy + datetime.timedelta(seconds=seconds)).strftime('%Y-%m-%d')

    df['Date'] = df['Decimal_Year'].apply(decimal_to_date)
    
    # 4. 保存 CSV
    output_path = '/Users/sweetpaper/Documents/GitHub/Michelle_Lin-Projects/profolio/IceProject/cleaned_greenland_data.csv'
    df[['Date', 'Mass_Gt', 'Uncertainty_Gt']].to_csv(output_path, index=False)
    
    print(f"✅ 清洗成功！文件已保存至: {output_path}")
    print(df.head())