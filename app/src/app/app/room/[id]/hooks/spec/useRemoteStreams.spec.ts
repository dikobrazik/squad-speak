import { act, type RenderHookResult, renderHook } from "@testing-library/react";
import { mockType } from "@/src/utils/test";
import { useRemoteStreams } from "../useRemoteStreams";

const mediaStreamMock = mockType<MediaStream>({ mediaStream: 1 });
const mediaStreamMock2 = mockType<MediaStream>({ mediaStream: 1 });

describe("useRemoteStreams", () => {
  it("должен вернуть мапу стримов", () => {
    const { result } = renderHook(() => useRemoteStreams());

    expect(result.current.remoteStreams).toBeInstanceOf(Map);
  });

  describe("если добавить стрим", () => {
    it("должен добавить его по userId", () => {
      const { result } = renderHook(() => useRemoteStreams());

      act(() => {
        result.current.addStream("user-1", mediaStreamMock);
      });

      expect(result.current.remoteStreams.get("user-1")).toMatchSnapshot();
    });
  });

  describe("если коллекция с пользователями", () => {
    let renderResult: RenderHookResult<
      ReturnType<typeof useRemoteStreams>,
      void
    >;

    beforeEach(() => {
      renderResult = renderHook(() => useRemoteStreams());

      act(() => {
        renderResult.result.current.addStream("user-1", mediaStreamMock);
        renderResult.result.current.addStream("user-2", mediaStreamMock2);
      });
    });

    afterEach(() => {
      // проверяем, что коллекция выглядит норм
      expect(
        Object.fromEntries(renderResult.result.current.remoteStreams),
      ).toMatchSnapshot();
    });

    describe("если замутить user-2", () => {
      beforeEach(() => {
        act(() => {
          renderResult.result.current.muteStream("user-2");
        });
      });

      it("должен вернуть muted=true для него", () => {
        expect(
          renderResult.result.current.remoteStreams.get("user-2")?.muted,
        ).toBe(true);
      });

      it("должен не должен трогать другого", () => {
        expect(
          renderResult.result.current.remoteStreams.get("user-1")?.muted,
        ).toBe(false);
      });

      describe("если размутить пользователя который был замучен", () => {
        beforeEach(() => {
          act(() => {
            renderResult.result.current.unmuteStream("user-2");
          });
        });

        it("должен вернуть muted=false для него", () => {
          expect(
            renderResult.result.current.remoteStreams.get("user-2")?.muted,
          ).toBe(false);
        });

        it("должен не должен трогать другого", () => {
          expect(
            renderResult.result.current.remoteStreams.get("user-1")?.muted,
          ).toBe(false);
        });
      });
    });

    describe("если размутить пользователя который не был замучен", () => {
      beforeEach(() => {
        act(() => {
          renderResult.result.current.unmuteStream("user-2");
        });
      });

      it("должен вернуть muted=false для него", () => {
        expect(
          renderResult.result.current.remoteStreams.get("user-2")?.muted,
        ).toBe(false);
      });

      it("должен не должен трогать другого", () => {
        expect(
          renderResult.result.current.remoteStreams.get("user-1")?.muted,
        ).toBe(false);
      });
    });
  });
});
