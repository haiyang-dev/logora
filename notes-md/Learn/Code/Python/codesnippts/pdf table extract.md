```python
import fitz

def pdf_search_table_mupdf(report_path, patterns, start_page=0, end_page=None):
    results = []
    doc = open_report(report_path, retry_times=3, delay=1)
    if doc is None:
        logger.error(f"Failed to open report after attempts, just skipped.")
        return []
        # sys.exit(-1)
    num_pages = doc.page_count
    if end_page is None or end_page > num_pages:
        end_page = num_pages
    # match_pages = []
    for page_num in range(start_page, end_page):
        page = doc[page_num]
        # text = page.get_text('blocks')
        if not isinstance(patterns, list):
            patterns = [patterns]
        for pattern in patterns:  # 可以考虑每个pattern都完整的搜一遍？ 待定
            areas = page.search_for(pattern)
            # print(areas)
            if areas:  # 如果找到了关键字
                # match_pages.append(page_num)
                keyword_location = areas[0]  # 获取关键字的位置
                bottom_half = fitz.Rect(page.rect.x0, keyword_location.y0, page.rect.x1,
                                        page.rect.y1)  # 创建一个矩形，代表页面下半部分
                tables = page.find_tables(clip=bottom_half)  # 在指定区域内查找表格
                # tables = page.find_tables()  # 在整个页面查找表格，指定区域的结果需要慎重
                if tables:
                    logger.info(f"table title {pattern} found in page {page_num}:")
                    for table in tables:
                        results.append(table.to_pandas())
                        # print(table.to_pandas())
                        logger.info(f"{table.to_markdown()}")
                else:  # 可能出现当前页只有标题，而结果在下一页的情况
                    if page_num + 1 < num_pages:
                        tables_next = doc[page_num + 1].find_tables()
                        if tables_next:
                            for table in tables_next:
                                results.append(table.to_pandas())
                        else:
                            logger.error(
                                f"table title {pattern} found, but table info not found in the page {page_num} and {page_num + 1}")
        # 如果找到了， 那大概率第一个就是表格， 所以直接break
        if len(results) > 0:
            return results
    return results

```