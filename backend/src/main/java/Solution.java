import java.util.LinkedList;
import java.util.Queue;

class Solution {
    class pair{
        int row;
        int col;
        int time;
        public pair(int row, int col, int time) {
            this.row = row;
            this.col = col;
            this.time = time;
        }


    }
    public int orangesRot(int[][] grid){
        Queue<pair> q = new LinkedList<>();
        int n = grid.length;
        int m = grid[0].length;
        int fresh = 0;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                if(grid[i][j]==2){
                    q.offer(new pair(i,j,0));
                }else if(grid[i][j]==1) {
                    fresh++;
                }

            }
        }
        return bfs(grid, q, fresh);

    }

    private int bfs(int[][] grid, Queue<pair> q, int fresh) {
        int n = grid.length;
        int m = grid[0].length;
        int max = 0;
        int[] r = {1,-1,0,0};
        int[] c = {0,0,-1,1};
        while (!q.isEmpty()){
            pair top = q.poll();
            int row = top.row;
            int col = top.col;
            int time = top.time;
            max = Math.max(time, max);
            for (int i = 0; i < 4; i++) {
                    int nr= row+r[i];
                    int nc = col+c[i];
                if (nr < 0 || nc < 0 || nr >= n || nc >= m ||
                        grid[nr][nc] != 1) {
                    continue;
                }
                if(grid[nr][nc]==1){
                    grid[nr][nc]=2;
                    fresh--;
                }
                q.offer(new pair(nr, nc, time+1));
                }

            }
        if (fresh!=0) return -1;
        return max;
        }

}