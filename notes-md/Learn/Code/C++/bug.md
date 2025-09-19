size_t大坑， typedef unsigned __int64 size_t; 无符号整数，永远是正数！！不会为负

```
for (size_t i = vecInlineData.size()-1; i >= 0; --i) // 会死循环并且crash出去
for (size_t i = vecInlineData.size(); i >= 1; --i) //要改成这种
{
    TSRecordEx tsRec;
    if (ActiveCache::DataPipeline::RecordToResponse(this, m_UseNewDisplayFieldValue, vecInlineData[i-1], &tsRec))
    {
    tbex.recordList.push_back(tsRec);
    }
}
```