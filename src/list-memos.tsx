import { getPreferenceValues, List, ActionPanel, Action } from "@raycast/api";
import { useFetch, usePromise } from "@raycast/utils";
import { PreferenceValues, MemoListProps, Memo } from "./lib/types";
import { getSummary } from "./lib/summary";

async function getMemoItems(memos: Memo[]) {
  const data = await Promise.all(memos.map(async (memo) => ({ uid: memo.uid, title: await getSummary(memo) })));
  return data;
}

export default function listMemos() {
  const { memosServerUrl, memosServerToken } = getPreferenceValues<PreferenceValues>();

  const { isLoading, data, revalidate } = useFetch<MemoListProps>(`${memosServerUrl}/api/v1/memos`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${memosServerToken}`,
    },
  });

  const memos = data?.memos || [];
  const memoItems = usePromise(getMemoItems, [memos]);

  return (
    <List isLoading={isLoading} throttle>
      {memoItems.data?.map((item) => (
        <List.Item
          key={item.uid}
          title={item.title}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={`${memosServerUrl}/m/${item.uid}`} />
              <Action title="Reload" onAction={() => revalidate()} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
